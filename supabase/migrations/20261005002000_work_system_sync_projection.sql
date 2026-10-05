-- External work-system sync projection.
-- Stores operational linkage/state only. Provider credentials and task bodies remain outside AVELA.

create table if not exists public.work_system_connections (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  system text not null check (system in ('asana','monday','jira','notion','other')),
  label text not null,
  connection_ref text not null,
  state text not null default 'connected' check (state in ('connected','paused','disconnected')),
  last_sync_at timestamptz,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(club_id,system,connection_ref),
  unique(id,club_id)
);

create table if not exists public.external_work_packages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  connection_id uuid not null,
  decision_id text not null,
  package_key text not null,
  title text not null,
  external_package_ref text,
  external_package_url text,
  sync_state text not null default 'proposed'
    check (sync_state in ('proposed','created','syncing','synced','partial','error','archived')),
  item_count integer not null default 0 check (item_count >= 0),
  completed_count integer not null default 0 check (completed_count >= 0),
  blocked_count integer not null default 0 check (blocked_count >= 0),
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  last_sync_at timestamptz,
  sync_error text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(connection_id,club_id)
    references public.work_system_connections(id,club_id) on delete cascade,
  unique(club_id,decision_id,package_key),
  unique(id,club_id)
);

create table if not exists public.external_work_item_links (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  package_id uuid not null,
  package_item_key text not null,
  external_ref text not null,
  external_url text,
  state text not null check (state in ('created','in-progress','blocked','done')),
  assignee_label text,
  due_at timestamptz,
  blocker_label text,
  last_external_update_at timestamptz,
  last_sync_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(package_id,club_id)
    references public.external_work_packages(id,club_id) on delete cascade,
  unique(package_id,package_item_key),
  unique(package_id,external_ref)
);

alter table public.work_system_connections enable row level security;
alter table public.external_work_packages enable row level security;
alter table public.external_work_item_links enable row level security;

revoke all on public.work_system_connections, public.external_work_packages, public.external_work_item_links from anon;
grant select,insert,update on public.work_system_connections, public.external_work_packages, public.external_work_item_links to authenticated;

create policy "connections viewers can read work system connections"
on public.work_system_connections for select to authenticated
using (public.club_has_permission(club_id,'connections','view'));

create policy "connections editors can add work system connections"
on public.work_system_connections for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'connections','edit')
);

create policy "connections editors can update work system connections"
on public.work_system_connections for update to authenticated
using (public.club_has_permission(club_id,'connections','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'connections','edit')
);

create policy "campaign viewers can read external work packages"
on public.external_work_packages for select to authenticated
using (public.club_has_permission(club_id,'campaigns','view'));

create policy "campaign editors can add external work packages"
on public.external_work_packages for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'campaigns','edit')
);

create policy "campaign editors can update external work packages"
on public.external_work_packages for update to authenticated
using (public.club_has_permission(club_id,'campaigns','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'campaigns','edit')
);

create policy "campaign viewers can read external work item links"
on public.external_work_item_links for select to authenticated
using (public.club_has_permission(club_id,'campaigns','view'));

create policy "campaign editors can add external work item links"
on public.external_work_item_links for insert to authenticated
with check (
  created_by=(select auth.uid())
  and public.club_has_permission(club_id,'campaigns','edit')
);

create policy "campaign editors can update external work item links"
on public.external_work_item_links for update to authenticated
using (public.club_has_permission(club_id,'campaigns','edit'))
with check (public.club_has_permission(club_id,'campaigns','edit'));

create or replace function public.enforce_external_work_sync_shape()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  if TG_TABLE_NAME='external_work_packages' then
    if new.completed_count > new.item_count then
      raise exception 'completed_count cannot exceed item_count';
    end if;
    if new.blocked_count > new.item_count then
      raise exception 'blocked_count cannot exceed item_count';
    end if;
    new.updated_at := now();
  elsif TG_TABLE_NAME='external_work_item_links' then
    new.updated_at := now();
    new.last_sync_at := coalesce(new.last_sync_at,now());
  elsif TG_TABLE_NAME='work_system_connections' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_external_work_sync_shape() from public,anon;
grant execute on function public.enforce_external_work_sync_shape() to authenticated;

drop trigger if exists enforce_work_system_connection_shape on public.work_system_connections;
create trigger enforce_work_system_connection_shape
before insert or update on public.work_system_connections
for each row execute function public.enforce_external_work_sync_shape();

drop trigger if exists enforce_external_work_package_shape on public.external_work_packages;
create trigger enforce_external_work_package_shape
before insert or update on public.external_work_packages
for each row execute function public.enforce_external_work_sync_shape();

drop trigger if exists enforce_external_work_item_shape on public.external_work_item_links;
create trigger enforce_external_work_item_shape
before insert or update on public.external_work_item_links
for each row execute function public.enforce_external_work_sync_shape();

create index if not exists external_work_packages_decision_idx
on public.external_work_packages(club_id,decision_id,sync_state);

create index if not exists external_work_items_package_state_idx
on public.external_work_item_links(package_id,state,due_at);

create index if not exists external_work_items_club_state_idx
on public.external_work_item_links(club_id,state,due_at);

notify pgrst,'reload schema';
