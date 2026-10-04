create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.club_members (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('viewer','editor','approver','admin')),
  created_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

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

alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.campaign_workspaces enable row level security;
alter table public.credit_ledger enable row level security;

create or replace function private.is_club_member(target_club uuid, allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) is false
    and exists (
      select 1
      from public.club_members m
      where m.club_id = target_club
        and m.user_id = (select auth.uid())
        and (allowed_roles is null or m.role = any(allowed_roles))
    );
$$;

revoke all on function private.is_club_member(uuid, text[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_club_member(uuid, text[]) to authenticated;

revoke all on public.clubs from anon;
revoke all on public.club_members from anon;
revoke all on public.campaign_workspaces from anon;
revoke all on public.credit_ledger from anon;

grant select on public.clubs to authenticated;
grant select on public.club_members to authenticated;
grant select, insert, update on public.campaign_workspaces to authenticated;
grant select, insert on public.credit_ledger to authenticated;

drop policy if exists "members can read clubs" on public.clubs;
create policy "members can read clubs"
on public.clubs for select
to authenticated
using (private.is_club_member(id));

drop policy if exists "members can read memberships" on public.club_members;
create policy "members can read memberships"
on public.club_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_club_member(club_id, array['admin'])
);

drop policy if exists "members can read workspaces" on public.campaign_workspaces;
create policy "members can read workspaces"
on public.campaign_workspaces for select
to authenticated
using (private.is_club_member(club_id));

drop policy if exists "editors can insert workspaces" on public.campaign_workspaces;
create policy "editors can insert workspaces"
on public.campaign_workspaces for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and private.is_club_member(club_id, array['editor','approver','admin'])
);

drop policy if exists "editors can update workspaces" on public.campaign_workspaces;
create policy "editors can update workspaces"
on public.campaign_workspaces for update
to authenticated
using (private.is_club_member(club_id, array['editor','approver','admin']))
with check (
  updated_by = (select auth.uid())
  and private.is_club_member(club_id, array['editor','approver','admin'])
);

drop policy if exists "members can read credit ledger" on public.credit_ledger;
create policy "members can read credit ledger"
on public.credit_ledger for select
to authenticated
using (private.is_club_member(club_id));

drop policy if exists "editors can add credit events" on public.credit_ledger;
create policy "editors can add credit events"
on public.credit_ledger for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.is_club_member(club_id, array['editor','approver','admin'])
);

create index if not exists campaign_workspaces_club_fixture_idx
on public.campaign_workspaces(club_id, fixture_id);

create index if not exists credit_ledger_club_created_idx
on public.credit_ledger(club_id, created_at desc);

notify pgrst, 'reload schema';

