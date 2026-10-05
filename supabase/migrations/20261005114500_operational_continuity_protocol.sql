-- Operational continuity protocol for staff rotation.
-- Keeps handover state club-scoped and role-based; decision history remains immutable.

create table if not exists public.operational_continuity_cases (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  case_key text not null,
  departing_role text not null,
  effective_at timestamptz,
  continuity_owner_role text not null,
  successor_status text not null default 'unknown'
    check (successor_status in ('unknown','nominated','confirmed')),
  state text not null default 'planned'
    check (state in ('planned','handover','ready-to-transition','closed')),
  note text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  unique(club_id,case_key),
  unique(id,club_id)
);

create table if not exists public.operational_continuity_items (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  case_id uuid not null,
  category text not null check (
    category in ('decisions','requests','work-packages','contracts','calendar','sources','access','knowledge')
  ),
  title text not null,
  state text not null default 'pending'
    check (state in ('pending','transferred','verified','not-applicable')),
  owner_role text,
  reference_type text,
  reference_id text,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(case_id,club_id)
    references public.operational_continuity_cases(id,club_id) on delete cascade,
  unique(case_id,category,title)
);

alter table public.operational_continuity_cases enable row level security;
alter table public.operational_continuity_items enable row level security;

revoke all on public.operational_continuity_cases, public.operational_continuity_items from anon;
grant select,insert,update on public.operational_continuity_cases, public.operational_continuity_items to authenticated;

create policy "team viewers can read continuity cases"
on public.operational_continuity_cases for select to authenticated
using (public.club_has_permission(club_id,'users','view'));

create policy "team admins can add continuity cases"
on public.operational_continuity_cases for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'users','administer')
);

create policy "team admins can update continuity cases"
on public.operational_continuity_cases for update to authenticated
using (public.club_has_permission(club_id,'users','administer'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'users','administer')
);

create policy "team viewers can read continuity items"
on public.operational_continuity_items for select to authenticated
using (public.club_has_permission(club_id,'users','view'));

create policy "team admins can add continuity items"
on public.operational_continuity_items for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'users','administer')
);

create policy "team admins can update continuity items"
on public.operational_continuity_items for update to authenticated
using (public.club_has_permission(club_id,'users','administer'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'users','administer')
);

create or replace function public.enforce_operational_continuity_state()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
declare
  unresolved integer;
begin
  if TG_TABLE_NAME='operational_continuity_cases' then
    if TG_OP='UPDATE' and old.state='closed' then
      raise exception 'closed continuity cases are immutable';
    end if;

    if new.state='closed' then
      select count(*) into unresolved
      from public.operational_continuity_items item
      where item.case_id=new.id
        and item.club_id=new.club_id
        and item.state not in ('verified','not-applicable');

      if unresolved > 0 then
        raise exception 'continuity case cannot close while handover items remain unresolved';
      end if;

      if new.successor_status <> 'confirmed' then
        raise exception 'continuity case cannot close until successor coverage is confirmed';
      end if;

      new.closed_at := coalesce(new.closed_at,now());
    end if;

    new.updated_at := now();
  elsif TG_TABLE_NAME='operational_continuity_items' then
    if TG_OP='UPDATE' and old.state='verified' then
      raise exception 'verified continuity handover items are immutable';
    end if;

    if new.state='verified' and (TG_OP='INSERT' or old.state is distinct from 'verified') then
      new.verified_by := auth.uid();
      new.verified_at := coalesce(new.verified_at,now());
    end if;

    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_operational_continuity_state() from public,anon;
grant execute on function public.enforce_operational_continuity_state() to authenticated;

drop trigger if exists enforce_operational_continuity_case_state on public.operational_continuity_cases;
create trigger enforce_operational_continuity_case_state
before insert or update on public.operational_continuity_cases
for each row execute function public.enforce_operational_continuity_state();

drop trigger if exists enforce_operational_continuity_item_state on public.operational_continuity_items;
create trigger enforce_operational_continuity_item_state
before insert or update on public.operational_continuity_items
for each row execute function public.enforce_operational_continuity_state();

create index if not exists operational_continuity_cases_club_state_idx
on public.operational_continuity_cases(club_id,state,effective_at);

create index if not exists operational_continuity_items_case_state_idx
on public.operational_continuity_items(case_id,state,category);

notify pgrst,'reload schema';
