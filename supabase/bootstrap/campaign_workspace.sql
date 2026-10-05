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


-- One-time first-admin invite bound to a confirmed email address.
create table if not exists private.club_admin_invites (
  club_id uuid not null references public.clubs(id) on delete cascade,
  email text not null,
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (club_id, email)
);

revoke all on private.club_admin_invites from public, anon, authenticated;

create or replace function private.apply_confirmed_admin_invite()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare invite_club uuid;
begin
  if new.email is null or new.email_confirmed_at is null then
    return new;
  end if;

  select club_id into invite_club
  from private.club_admin_invites
  where lower(email)=lower(new.email)
    and claimed_at is null
  order by created_at asc
  limit 1
  for update;

  if invite_club is null then
    return new;
  end if;

  if exists (
    select 1 from public.club_memberships
    where club_id=invite_club and active and role='admin'
  ) then
    return new;
  end if;

  insert into public.club_memberships (club_id,user_id,role,active)
  values (invite_club,new.id,'admin',true)
  on conflict (club_id,user_id)
  do update set role='admin', active=true;

  update private.club_admin_invites
  set claimed_by=new.id, claimed_at=now()
  where club_id=invite_club
    and lower(email)=lower(new.email)
    and claimed_at is null;

  return new;
end;
$$;

revoke all on function private.apply_confirmed_admin_invite() from public, anon, authenticated;

drop trigger if exists apply_confirmed_admin_invite on auth.users;
create trigger apply_confirmed_admin_invite
after insert or update of email_confirmed_at, email on auth.users
for each row execute function private.apply_confirmed_admin_invite();


create index if not exists club_admin_invites_claimed_by_idx
on private.club_admin_invites(claimed_by);


-- Shared player-pack selection state for fixture-led and commercial campaigns.
create table if not exists public.player_pack_selections (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  campaign_id text not null,
  status text not null default 'selected' check (status in ('selected','approved','committed')),
  selected_player_ids text[] not null default '{}',
  player_count integer not null check (player_count >= 0),
  snapshot jsonb not null default '{}'::jsonb,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (club_id, campaign_id)
);

alter table public.player_pack_selections enable row level security;
revoke all on public.player_pack_selections from anon;
grant select, insert, update on public.player_pack_selections to authenticated;

drop policy if exists "campaign viewers can read player pack selections" on public.player_pack_selections;
create policy "campaign viewers can read player pack selections"
on public.player_pack_selections for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "campaign editors can insert player pack selections" on public.player_pack_selections;
create policy "campaign editors can insert player pack selections"
on public.player_pack_selections for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and (
    (status = 'selected' and public.club_has_permission(club_id, 'campaigns', 'edit'))
    or
    (status in ('approved','committed') and public.club_has_permission(club_id, 'campaigns', 'approve'))
  )
);

drop policy if exists "campaign editors can update player pack selections" on public.player_pack_selections;
create policy "campaign editors can update player pack selections"
on public.player_pack_selections for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'))
with check (
  updated_by = (select auth.uid())
  and (
    (status = 'selected' and public.club_has_permission(club_id, 'campaigns', 'edit'))
    or
    (status in ('approved','committed') and public.club_has_permission(club_id, 'campaigns', 'approve'))
  )
);

create index if not exists player_pack_selections_club_campaign_idx
on public.player_pack_selections(club_id, campaign_id);

create index if not exists player_pack_selections_updated_by_idx
on public.player_pack_selections(updated_by);

notify pgrst, 'reload schema';


-- Enforce player-pack lifecycle independently of the client.
create or replace function public.enforce_player_pack_status_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.status <> 'selected' then
    raise exception 'Player pack must be selected before approval or commitment';
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'selected' and new.status not in ('selected','approved') then
      raise exception 'Selected pack can only remain selected or become approved';
    end if;
    if old.status = 'approved' and new.status not in ('approved','committed') then
      raise exception 'Approved pack can only remain approved or become committed';
    end if;
    if old.status = 'committed' and new.status <> 'committed' then
      raise exception 'Committed player pack status is immutable';
    end if;
  end if;

  if new.status in ('approved','committed')
     and coalesce((new.snapshot->>'blockerCount')::integer, 0) > 0 then
    raise exception 'Player pack blockers must be resolved before approval or commitment';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_player_pack_status_transition on public.player_pack_selections;
create trigger enforce_player_pack_status_transition
before insert or update on public.player_pack_selections
for each row execute function public.enforce_player_pack_status_transition();

revoke all on function public.enforce_player_pack_status_transition() from public, anon, authenticated;


-- Unified campaign persistence for fixture-led and commercial campaigns.
create table if not exists public.campaign_records (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  campaign_key text not null,
  campaign_kind text not null check (campaign_kind in ('fixture','commercial')),
  fixture_id text,
  status text not null default 'draft' check (status in ('draft','review-ready','approved','committed','handoff-ready')),
  state jsonb not null default '{}'::jsonb,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (club_id, campaign_key)
);

alter table public.campaign_records enable row level security;
revoke all on public.campaign_records from anon;
grant select, insert, update on public.campaign_records to authenticated;

drop policy if exists "campaign viewers can read campaign records" on public.campaign_records;
create policy "campaign viewers can read campaign records"
on public.campaign_records for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "campaign editors can insert campaign records" on public.campaign_records;
create policy "campaign editors can insert campaign records"
on public.campaign_records for insert
to authenticated
with check (
  updated_by=(select auth.uid())
  and (
    (status in ('draft','review-ready','handoff-ready') and public.club_has_permission(club_id,'campaigns','edit'))
    or
    (status in ('approved','committed') and public.club_has_permission(club_id,'campaigns','approve'))
  )
);

drop policy if exists "campaign editors can update campaign records" on public.campaign_records;
create policy "campaign editors can update campaign records"
on public.campaign_records for update
to authenticated
using (public.club_has_permission(club_id,'campaigns','view'))
with check (
  updated_by=(select auth.uid())
  and (
    (status in ('draft','review-ready','handoff-ready') and public.club_has_permission(club_id,'campaigns','edit'))
    or
    (status in ('approved','committed') and public.club_has_permission(club_id,'campaigns','approve'))
  )
);

create index if not exists campaign_records_club_kind_updated_idx
on public.campaign_records(club_id,campaign_kind,updated_at desc);

create index if not exists campaign_records_fixture_idx
on public.campaign_records(club_id,fixture_id)
where fixture_id is not null;

insert into public.campaign_records (
  club_id,campaign_key,campaign_kind,fixture_id,status,state,updated_by,updated_at
)
select
  club_id,
  fixture_id,
  'fixture',
  fixture_id,
  case when status='approved' then 'approved' when status='review-ready' then 'review-ready' else 'draft' end,
  state,
  updated_by,
  updated_at
from public.campaign_workspaces
on conflict (club_id,campaign_key) do nothing;

notify pgrst,'reload schema';

create index if not exists campaign_records_updated_by_idx
on public.campaign_records(updated_by);
