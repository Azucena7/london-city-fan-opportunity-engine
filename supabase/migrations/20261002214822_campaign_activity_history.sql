-- Persistent campaign activity history for club workspaces.
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

create policy "campaign viewers can read activity"
on public.campaign_activity for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

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

