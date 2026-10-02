-- Apply only to the approved Supabase project after review.
-- Intentionally not executed by the app or during builds.
begin;
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now()
);
create table public.club_memberships (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'operator', 'approver', 'viewer')),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (club_id, user_id)
);
create index club_memberships_user_active on public.club_memberships(user_id, active);
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
revoke all on public.clubs, public.club_memberships from public, anon, authenticated;
grant select on public.clubs, public.club_memberships to authenticated;
create policy own_active_memberships on public.club_memberships for select to authenticated
  using (user_id = (select auth.uid()) and active = true);
create policy member_clubs on public.clubs for select to authenticated
  using (exists (select 1 from public.club_memberships m where m.club_id = clubs.id and m.user_id = (select auth.uid()) and m.active = true));
-- No insert/update/delete grants or policies for application users.
-- Club membership and role changes require trusted project administration.
commit;
