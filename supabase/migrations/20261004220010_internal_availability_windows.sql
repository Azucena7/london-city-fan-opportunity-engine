create table if not exists public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  subject_type text not null check (subject_type in ('squad','player','staff-role','team','department','venue')),
  subject_id text,
  subject_label text not null,
  availability_type text not null check (availability_type in ('hard-unavailable','protected','preferred','busy','tentative','available')),
  reason_type text not null check (reason_type in ('off-day','christmas-break','recovery','travel','training','international-duty','internal-event','external-event','personal-calendar','venue-block','other')),
  title text not null,
  detail text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source_type text not null default 'internal' check (source_type in ('internal','external','connector','user')),
  source_ref text,
  confidence text not null default 'confirmed' check (confidence in ('confirmed','likely','tentative')),
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.availability_windows enable row level security;
revoke all on public.availability_windows from anon;
grant select, insert, update on public.availability_windows to authenticated;

create policy "club members can read availability"
on public.availability_windows for select
to authenticated
using (public.club_has_permission(club_id, 'calendar', 'view'));

create policy "club editors can add availability"
on public.availability_windows for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'calendar', 'edit')
);

create policy "club editors can update availability"
on public.availability_windows for update
to authenticated
using (public.club_has_permission(club_id, 'calendar', 'edit'))
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'calendar', 'edit')
);

create index if not exists availability_windows_club_time_idx
on public.availability_windows(club_id, starts_at, ends_at);
create index if not exists availability_windows_subject_idx
on public.availability_windows(club_id, subject_type, subject_id, starts_at);
create index if not exists availability_windows_created_by_idx
on public.availability_windows(created_by);
create index if not exists availability_windows_updated_by_idx
on public.availability_windows(updated_by);

notify pgrst, 'reload schema';
