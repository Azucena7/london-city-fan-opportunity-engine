-- Work-system routing policy.
-- Routing configuration never stores provider credentials and always requires human confirmation.

create table if not exists public.work_routing_rules (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  label text not null,
  enabled boolean not null default true,
  categories text[] not null default '{}'::text[],
  destination_system text not null check (destination_system in ('asana','monday','jira','notion','other')),
  connection_id uuid not null,
  require_confirmation boolean not null default true check (require_confirmation = true),
  priority integer not null default 100,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(connection_id,club_id)
    references public.work_system_connections(id,club_id) on delete cascade,
  check (cardinality(categories) > 0),
  check (categories <@ array['approval','activation','schedule']::text[])
);

alter table public.work_routing_rules enable row level security;
revoke all on public.work_routing_rules from anon;
grant select,insert,update on public.work_routing_rules to authenticated;

create policy "connections viewers can read work routing rules"
on public.work_routing_rules for select to authenticated
using (public.club_has_permission(club_id,'connections','view'));

create policy "connections editors can add work routing rules"
on public.work_routing_rules for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'connections','edit')
);

create policy "connections editors can update work routing rules"
on public.work_routing_rules for update to authenticated
using (public.club_has_permission(club_id,'connections','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'connections','edit')
);

create or replace function public.enforce_work_routing_rule_shape()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
declare
  connected_system text;
  connection_state text;
begin
  select system,state into connected_system,connection_state
  from public.work_system_connections
  where id=new.connection_id and club_id=new.club_id;

  if connected_system is null then
    raise exception 'routing rule requires a same-club work-system connection';
  end if;

  if connected_system is distinct from new.destination_system then
    raise exception 'routing destination_system must match the selected connection';
  end if;

  if connection_state is distinct from 'connected' and new.enabled then
    raise exception 'an enabled routing rule requires a connected destination';
  end if;

  if new.require_confirmation is distinct from true then
    raise exception 'external work routing currently requires human confirmation';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.enforce_work_routing_rule_shape() from public,anon;
grant execute on function public.enforce_work_routing_rule_shape() to authenticated;

drop trigger if exists enforce_work_routing_rule_shape on public.work_routing_rules;
create trigger enforce_work_routing_rule_shape
before insert or update on public.work_routing_rules
for each row execute function public.enforce_work_routing_rule_shape();

create index if not exists work_routing_rules_club_priority_idx
on public.work_routing_rules(club_id,enabled,priority desc);

notify pgrst,'reload schema';
