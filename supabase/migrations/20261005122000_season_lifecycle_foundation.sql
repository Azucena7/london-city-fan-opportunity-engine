-- AVELA season lifecycle foundation.
-- Keeps active season state separate from immutable historical snapshots and rollover review.

create table if not exists public.club_seasons (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  season_key text not null,
  label text not null,
  state text not null default 'draft' check (state in ('draft','active','closed')),
  starts_on date,
  ends_on date,
  opened_at timestamptz,
  closed_at timestamptz,
  opened_by uuid references auth.users(id),
  closed_by uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(club_id, season_key),
  unique(id, club_id),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  check (
    (state <> 'active')
    or (opened_at is not null and opened_by is not null)
  ),
  check (
    (state <> 'closed')
    or (closed_at is not null and closed_by is not null)
  )
);

create unique index if not exists club_seasons_one_active_idx
on public.club_seasons(club_id)
where state='active';

create table if not exists public.season_snapshots (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  season_id uuid not null,
  snapshot_version integer not null default 1 check (snapshot_version > 0),
  summary jsonb not null default '{}'::jsonb,
  decision_counts jsonb not null default '{}'::jsonb,
  campaign_counts jsonb not null default '{}'::jsonb,
  outcome_counts jsonb not null default '{}'::jsonb,
  learning_counts jsonb not null default '{}'::jsonb,
  unresolved_items jsonb not null default '[]'::jsonb,
  source_refs jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(season_id, snapshot_version),
  unique(id, club_id),
  foreign key(season_id, club_id)
    references public.club_seasons(id, club_id) on delete cascade
);

create table if not exists public.season_rollover_items (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  from_season_id uuid not null,
  to_season_id uuid not null,
  item_type text not null check (
    item_type in ('contract','obligation','restriction','campaign','decision','availability','other')
  ),
  source_type text not null,
  source_id text not null,
  label text not null,
  rationale text,
  rollover_state text not null default 'needs-review'
    check (rollover_state in ('auto','needs-review','blocked','accepted','rejected')),
  block_reason text,
  payload jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(from_season_id, club_id)
    references public.club_seasons(id, club_id) on delete cascade,
  foreign key(to_season_id, club_id)
    references public.club_seasons(id, club_id) on delete cascade,
  unique(to_season_id, item_type, source_type, source_id),
  check (from_season_id <> to_season_id),
  check (
    (rollover_state not in ('accepted','rejected'))
    or (reviewed_by is not null and reviewed_at is not null)
  )
);

alter table public.club_seasons enable row level security;
alter table public.season_snapshots enable row level security;
alter table public.season_rollover_items enable row level security;

revoke all on public.club_seasons, public.season_snapshots, public.season_rollover_items from anon;
grant select, insert, update on public.club_seasons, public.season_rollover_items to authenticated;
grant select, insert on public.season_snapshots to authenticated;

create policy "club members can read seasons"
on public.club_seasons for select to authenticated
using (public.club_has_permission(club_id,'overview','view'));

create policy "governance editors can add seasons"
on public.club_seasons for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance editors can update seasons"
on public.club_seasons for update to authenticated
using (public.club_has_permission(club_id,'governance','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "club members can read season snapshots"
on public.season_snapshots for select to authenticated
using (public.club_has_permission(club_id,'overview','view'));

create policy "governance approvers can create season snapshots"
on public.season_snapshots for insert to authenticated
with check (
  created_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','approve')
  and exists (
    select 1
    from public.club_seasons s
    where s.id=season_id
      and s.club_id=club_id
      and s.state='closed'
  )
);

create policy "club members can read rollover items"
on public.season_rollover_items for select to authenticated
using (public.club_has_permission(club_id,'overview','view'));

create policy "governance editors can add rollover items"
on public.season_rollover_items for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance editors can update rollover items"
on public.season_rollover_items for update to authenticated
using (public.club_has_permission(club_id,'governance','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create or replace function public.enforce_season_lifecycle_permissions()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  if new.state in ('active','closed')
     and (
       TG_OP='INSERT'
       or old.state is distinct from new.state
     )
     and not public.club_has_permission(new.club_id,'governance','approve') then
    raise exception 'governance approve permission is required to open or close a season';
  end if;

  if TG_OP='UPDATE' and old.state='closed' then
    raise exception 'closed season state is immutable';
  end if;

  if new.state='active' and (TG_OP='INSERT' or old.state is distinct from 'active') then
    new.opened_by := auth.uid();
    new.opened_at := coalesce(new.opened_at, now());
    new.closed_by := null;
    new.closed_at := null;
  end if;

  if new.state='closed' and (TG_OP='INSERT' or old.state is distinct from 'closed') then
    new.closed_by := auth.uid();
    new.closed_at := coalesce(new.closed_at, now());
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_season_lifecycle_permissions() from public, anon;
grant execute on function public.enforce_season_lifecycle_permissions() to authenticated;

drop trigger if exists enforce_season_lifecycle on public.club_seasons;
create trigger enforce_season_lifecycle
before insert or update on public.club_seasons
for each row execute function public.enforce_season_lifecycle_permissions();

create or replace function public.prevent_season_snapshot_mutation()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  raise exception 'season snapshots are immutable';
end;
$$;

revoke all on function public.prevent_season_snapshot_mutation() from public, anon;
grant execute on function public.prevent_season_snapshot_mutation() to authenticated;

drop trigger if exists prevent_season_snapshot_update on public.season_snapshots;
create trigger prevent_season_snapshot_update
before update or delete on public.season_snapshots
for each row execute function public.prevent_season_snapshot_mutation();

create or replace function public.enforce_rollover_review_permissions()
returns trigger
language plpgsql
security invoker
set search_path=''
as $
declare
  from_state text;
  to_state text;
begin
  select s.state into from_state
  from public.club_seasons s
  where s.id=new.from_season_id and s.club_id=new.club_id;

  select s.state into to_state
  from public.club_seasons s
  where s.id=new.to_season_id and s.club_id=new.club_id;

  if from_state is distinct from 'closed' then
    raise exception 'rollover source season must be closed';
  end if;

  if to_state not in ('draft','active') then
    raise exception 'rollover target season must be draft or active';
  end if;

  if TG_OP='UPDATE' and old.rollover_state in ('accepted','rejected') then
    raise exception 'reviewed rollover decisions are immutable';
  end if;

  if new.rollover_state in ('accepted','rejected')
     and (
       TG_OP='INSERT'
       or old.rollover_state is distinct from new.rollover_state
     ) then
    if not public.club_has_permission(new.club_id,'governance','approve') then
      raise exception 'governance approve permission is required to accept or reject rollover';
    end if;
    new.reviewed_by := auth.uid();
    new.reviewed_at := coalesce(new.reviewed_at, now());
  end if;
  return new;
end;
$;

revoke all on function public.enforce_rollover_review_permissions() from public, anon;
grant execute on function public.enforce_rollover_review_permissions() to authenticated;

drop trigger if exists enforce_rollover_review on public.season_rollover_items;
create trigger enforce_rollover_review
before insert or update on public.season_rollover_items
for each row execute function public.enforce_rollover_review_permissions();

create index if not exists club_seasons_club_state_idx
on public.club_seasons(club_id,state,starts_on);

create index if not exists season_snapshots_club_created_idx
on public.season_snapshots(club_id,created_at desc);

create index if not exists season_rollover_items_target_state_idx
on public.season_rollover_items(club_id,to_season_id,rollover_state,item_type);

create index if not exists club_seasons_created_by_idx on public.club_seasons(created_by);
create index if not exists club_seasons_updated_by_idx on public.club_seasons(updated_by);
create index if not exists season_snapshots_created_by_idx on public.season_snapshots(created_by);
create index if not exists season_rollover_items_created_by_idx on public.season_rollover_items(created_by);
create index if not exists season_rollover_items_updated_by_idx on public.season_rollover_items(updated_by);
create index if not exists season_rollover_items_reviewed_by_idx on public.season_rollover_items(reviewed_by);

notify pgrst, 'reload schema';
