create table if not exists public.workload_items (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  decision_id text,
  subject_type text not null check (subject_type in ('person','staff-role','team','department')),
  subject_id text,
  subject_label text not null,
  title text not null,
  state text not null default 'planned' check (state in ('planned','in-progress','blocked','done','cancelled')),
  estimated_minutes integer not null check (estimated_minutes >= 0),
  complexity_score integer not null default 1 check (complexity_score between 1 and 5),
  due_at timestamptz,
  starts_at timestamptz,
  source_type text not null default 'internal' check (source_type in ('internal','connector','user','engine')),
  external_system text,
  external_ref text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.capacity_windows (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  subject_type text not null check (subject_type in ('person','staff-role','team','department')),
  subject_id text,
  subject_label text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  available_minutes integer not null check (available_minutes >= 0),
  source_type text not null default 'internal' check (source_type in ('internal','connector','user')),
  external_system text,
  external_ref text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.workload_items enable row level security;
alter table public.capacity_windows enable row level security;
revoke all on public.workload_items from anon;
revoke all on public.capacity_windows from anon;
grant select, insert, update on public.workload_items to authenticated;
grant select, insert, update on public.capacity_windows to authenticated;

create policy "club members can read workload" on public.workload_items for select to authenticated
using (public.club_has_permission(club_id, 'overview', 'view'));

create policy "club editors can add workload" on public.workload_items for insert to authenticated
with check (created_by=(select auth.uid()) and updated_by=(select auth.uid()) and public.club_has_permission(club_id,'overview','edit'));

create policy "club editors can update workload" on public.workload_items for update to authenticated
using (public.club_has_permission(club_id,'overview','edit'))
with check (updated_by=(select auth.uid()) and public.club_has_permission(club_id,'overview','edit'));

create policy "club members can read capacity" on public.capacity_windows for select to authenticated
using (public.club_has_permission(club_id, 'overview', 'view'));

create policy "club editors can add capacity" on public.capacity_windows for insert to authenticated
with check (created_by=(select auth.uid()) and updated_by=(select auth.uid()) and public.club_has_permission(club_id,'overview','edit'));

create policy "club editors can update capacity" on public.capacity_windows for update to authenticated
using (public.club_has_permission(club_id,'overview','edit'))
with check (updated_by=(select auth.uid()) and public.club_has_permission(club_id,'overview','edit'));

create index if not exists workload_items_club_due_idx on public.workload_items(club_id,due_at);
create index if not exists workload_items_subject_idx on public.workload_items(club_id,subject_type,subject_id,state);
create index if not exists workload_items_created_by_idx on public.workload_items(created_by);
create index if not exists workload_items_updated_by_idx on public.workload_items(updated_by);
create index if not exists capacity_windows_club_time_idx on public.capacity_windows(club_id,starts_at,ends_at);
create index if not exists capacity_windows_subject_idx on public.capacity_windows(club_id,subject_type,subject_id,starts_at);
create index if not exists capacity_windows_created_by_idx on public.capacity_windows(created_by);
create index if not exists capacity_windows_updated_by_idx on public.capacity_windows(updated_by);

notify pgrst, 'reload schema';
