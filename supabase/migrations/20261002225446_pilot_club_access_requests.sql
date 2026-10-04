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

drop policy if exists "users can read own access requests" on public.club_access_requests;
create policy "users can read own access requests"
on public.club_access_requests for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.club_has_permission(club_id, 'campaigns', 'administer')
);

drop policy if exists "users can request club access" on public.club_access_requests;
create policy "users can request club access"
on public.club_access_requests for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
);

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
using (
  user_id = (select auth.uid())
  or public.club_has_permission(club_id, 'campaigns', 'administer')
);

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

create index if not exists club_access_requests_club_status_idx
on public.club_access_requests(club_id, status, created_at desc);

create index if not exists club_access_requests_user_idx
on public.club_access_requests(user_id, created_at desc);

notify pgrst, 'reload schema';

