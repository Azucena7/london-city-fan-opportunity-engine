-- Pilot-ready multi-user persistence for club campaign workspaces.
-- Apply in Supabase before enabling remote workspace persistence.

create extension if not exists pgcrypto;

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

create policy "members can read clubs"
on public.clubs for select
using (exists (
  select 1 from public.club_members m
  where m.club_id = clubs.id and m.user_id = auth.uid()
));

create policy "members can read memberships"
on public.club_members for select
using (user_id = auth.uid() or exists (
  select 1 from public.club_members m
  where m.club_id = club_members.club_id
    and m.user_id = auth.uid()
    and m.role = 'admin'
));

create policy "members can read workspaces"
on public.campaign_workspaces for select
using (exists (
  select 1 from public.club_members m
  where m.club_id = campaign_workspaces.club_id and m.user_id = auth.uid()
));

create policy "editors can insert workspaces"
on public.campaign_workspaces for insert
with check (
  updated_by = auth.uid()
  and exists (
    select 1 from public.club_members m
    where m.club_id = campaign_workspaces.club_id
      and m.user_id = auth.uid()
      and m.role in ('editor','approver','admin')
  )
);

create policy "editors can update workspaces"
on public.campaign_workspaces for update
using (exists (
  select 1 from public.club_members m
  where m.club_id = campaign_workspaces.club_id
    and m.user_id = auth.uid()
    and m.role in ('editor','approver','admin')
))
with check (updated_by = auth.uid());

create policy "members can read credit ledger"
on public.credit_ledger for select
using (exists (
  select 1 from public.club_members m
  where m.club_id = credit_ledger.club_id and m.user_id = auth.uid()
));

create policy "editors can add credit events"
on public.credit_ledger for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.club_members m
    where m.club_id = credit_ledger.club_id
      and m.user_id = auth.uid()
      and m.role in ('editor','approver','admin')
  )
);

create index if not exists campaign_workspaces_club_fixture_idx
on public.campaign_workspaces(club_id, fixture_id);

create index if not exists credit_ledger_club_created_idx
on public.credit_ledger(club_id, created_at desc);
