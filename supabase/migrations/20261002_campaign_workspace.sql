-- Campaign workspace persistence integrated with the existing club membership/permission model.
-- The project already provides:
--   public.clubs
--   public.club_memberships
--   public.club_role_permissions
--   public.club_member_permissions
--   public.club_has_permission(club, area, action)

create extension if not exists pgcrypto;

create table if not exists public.campaign_workspaces (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  fixture_id text not null,
  status text not null default 'draft' check (status in ('draft','review-ready','approved')),
  state jsonb not null default '{}'::jsonb,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (club_id, fixture_id)
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  fixture_id text,
  item_id text,
  event_key text unique,
  event_type text not null check (event_type in ('commit','release','consume','adjust')),
  credits integer not null check (credits > 0),
  note text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.campaign_workspaces enable row level security;
alter table public.credit_ledger enable row level security;

revoke all on public.campaign_workspaces from anon;
revoke all on public.credit_ledger from anon;

grant select, insert, update on public.campaign_workspaces to authenticated;
grant select, insert on public.credit_ledger to authenticated;

drop policy if exists "campaign viewers can read workspaces" on public.campaign_workspaces;
create policy "campaign viewers can read workspaces"
on public.campaign_workspaces for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "campaign editors can insert workspaces" on public.campaign_workspaces;
create policy "campaign editors can insert workspaces"
on public.campaign_workspaces for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and (
    (status <> 'approved' and public.club_has_permission(club_id, 'campaigns', 'edit'))
    or
    (status = 'approved' and public.club_has_permission(club_id, 'campaigns', 'approve'))
  )
);

drop policy if exists "campaign editors can update workspaces" on public.campaign_workspaces;
create policy "campaign editors can update workspaces"
on public.campaign_workspaces for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'edit'))
with check (
  updated_by = (select auth.uid())
  and (
    (status <> 'approved' and public.club_has_permission(club_id, 'campaigns', 'edit'))
    or
    (status = 'approved' and public.club_has_permission(club_id, 'campaigns', 'approve'))
  )
);

drop policy if exists "campaign viewers can read credit ledger" on public.credit_ledger;
create policy "campaign viewers can read credit ledger"
on public.credit_ledger for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "campaign editors can add credit events" on public.credit_ledger;
create policy "campaign editors can add credit events"
on public.credit_ledger for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'edit')
);

create index if not exists campaign_workspaces_club_fixture_idx
on public.campaign_workspaces(club_id, fixture_id);

create index if not exists campaign_workspaces_updated_by_idx
on public.campaign_workspaces(updated_by);

create index if not exists credit_ledger_club_created_idx
on public.credit_ledger(club_id, created_at desc);

create index if not exists credit_ledger_created_by_idx
on public.credit_ledger(created_by);

notify pgrst, 'reload schema';


-- Persistent activity log for review, generation, reservation and launch handoff.
create table if not exists public.campaign_activity (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  fixture_id text not null,
  event_key text unique,
  event_type text not null check (event_type in ('review','draft-generated','reserve','release','launch-handoff')),
  label text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.campaign_activity enable row level security;
revoke all on public.campaign_activity from anon;
grant select, insert on public.campaign_activity to authenticated;

drop policy if exists "campaign viewers can read activity" on public.campaign_activity;
create policy "campaign viewers can read activity"
on public.campaign_activity for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "campaign editors can add activity" on public.campaign_activity;
create policy "campaign editors can add activity"
on public.campaign_activity for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'edit')
);

create index if not exists campaign_activity_club_fixture_created_idx
on public.campaign_activity(club_id, fixture_id, created_at desc);

create index if not exists campaign_activity_created_by_idx
on public.campaign_activity(created_by);

notify pgrst, 'reload schema';


-- Persistent club onboarding context used across fixtures.
create table if not exists public.club_setup (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  fixture_source text not null default 'manual' check (fixture_source in ('manual','calendar-feed','ticketing')),
  connected_channels text[] not null default '{}',
  priority_objectives text[] not null default '{}',
  brand_rules jsonb not null default '{}'::jsonb,
  approval_rules jsonb not null default '{}'::jsonb,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.club_setup enable row level security;
revoke all on public.club_setup from anon;
grant select, insert, update on public.club_setup to authenticated;

drop policy if exists "club members can read setup" on public.club_setup;
create policy "club members can read setup"
on public.club_setup for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "club admins can insert setup" on public.club_setup;
create policy "club admins can insert setup"
on public.club_setup for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'administer')
);

drop policy if exists "club admins can update setup" on public.club_setup;
create policy "club admins can update setup"
on public.club_setup for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'administer'))
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'administer')
);

notify pgrst, 'reload schema';


-- Secure pilot access requests. Authentication alone never grants club access.
create table if not exists public.club_access_requests (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  requested_role text not null default 'viewer' check (requested_role in ('viewer','marketing','ticketing','business','communications','compliance','direction')),
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (club_id, user_id)
);

alter table public.club_access_requests enable row level security;
revoke all on public.club_access_requests from anon;
grant select, insert, update on public.club_access_requests to authenticated;

drop policy if exists "authenticated users can discover clubs" on public.clubs;
create policy "authenticated users can discover clubs"
on public.clubs for select
to authenticated
using (coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) is false);

drop policy if exists "users can read own access requests" on public.club_access_requests;
create policy "users can read own access requests"
on public.club_access_requests for select
to authenticated
using (user_id = (select auth.uid()) or public.club_has_permission(club_id, 'campaigns', 'administer'));

drop policy if exists "users can request club access" on public.club_access_requests;
create policy "users can request club access"
on public.club_access_requests for insert
to authenticated
with check (user_id = (select auth.uid()) and status = 'pending' and reviewed_by is null and reviewed_at is null);

drop policy if exists "club admins can review access requests" on public.club_access_requests;
create policy "club admins can review access requests"
on public.club_access_requests for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'administer'))
with check (public.club_has_permission(club_id, 'campaigns', 'administer'));

drop policy if exists "club admins can read memberships" on public.club_memberships;
create policy "club admins can read memberships"
on public.club_memberships for select
to authenticated
using (user_id = (select auth.uid()) or public.club_has_permission(club_id, 'campaigns', 'administer'));

drop policy if exists "club admins can insert memberships" on public.club_memberships;
create policy "club admins can insert memberships"
on public.club_memberships for insert
to authenticated
with check (public.club_has_permission(club_id, 'campaigns', 'administer'));

drop policy if exists "club admins can update memberships" on public.club_memberships;
create policy "club admins can update memberships"
on public.club_memberships for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'administer'))
with check (public.club_has_permission(club_id, 'campaigns', 'administer'));

create or replace function public.approve_club_access_request(request_id uuid, membership_role text)
returns public.club_access_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare req public.club_access_requests;
begin
  if membership_role not in ('viewer','marketing','ticketing','business','communications','compliance','direction','admin') then
    raise exception 'Unsupported membership role';
  end if;
  select * into req from public.club_access_requests where id = request_id and status = 'pending' for update;
  if req.id is null then raise exception 'Pending access request not found'; end if;
  if not public.club_has_permission(req.club_id, 'campaigns', 'administer') then raise exception 'Not authorised to approve this club'; end if;
  insert into public.club_memberships (club_id, user_id, role, active)
  values (req.club_id, req.user_id, membership_role, true)
  on conflict (club_id, user_id) do update set role = excluded.role, active = true;
  update public.club_access_requests
  set status='approved', reviewed_by=(select auth.uid()), reviewed_at=now(), requested_role=membership_role
  where id=req.id returning * into req;
  return req;
end;
$$;

revoke all on function public.approve_club_access_request(uuid, text) from public;
grant execute on function public.approve_club_access_request(uuid, text) to authenticated;

create index if not exists club_access_requests_club_status_idx on public.club_access_requests(club_id, status, created_at desc);
create index if not exists club_access_requests_user_idx on public.club_access_requests(user_id, created_at desc);

notify pgrst, 'reload schema';


-- Performance cleanup for pilot access policies.
drop policy if exists own_active_memberships on public.club_memberships;
drop policy if exists "club admins can read memberships" on public.club_memberships;
create policy "members and club admins can read memberships"
on public.club_memberships for select
to authenticated
using (
  (user_id = (select auth.uid()) and active)
  or public.club_has_permission(club_id, 'campaigns', 'administer')
);

drop policy if exists member_clubs on public.clubs;
drop policy if exists "authenticated users can discover clubs" on public.clubs;
create policy "authenticated users can discover clubs"
on public.clubs for select
to authenticated
using (coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) is false);

create index if not exists club_access_requests_reviewed_by_idx on public.club_access_requests(reviewed_by);
create index if not exists club_setup_updated_by_idx on public.club_setup(updated_by);

notify pgrst, 'reload schema';
