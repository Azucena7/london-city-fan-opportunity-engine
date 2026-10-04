-- Generic decision event history for AVELA institutional memory.
create table if not exists public.decision_events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  decision_id text not null,
  subject_type text not null check (subject_type in ('fixture','campaign','sponsor','player','contract','operations','learning')),
  subject_id text,
  event_key text unique,
  event_type text not null check (event_type in ('detected','recommended','changed','reviewed','approved','rejected','committed','executed','measured','learned','context-added','blocked','unblocked')),
  state text,
  label text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  source_type text not null default 'user' check (source_type in ('engine','user','connector','contract','historical')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.decision_events enable row level security;
revoke all on public.decision_events from anon;
grant select, insert on public.decision_events to authenticated;

create policy "club members can read decision history"
on public.decision_events for select
to authenticated
using (public.club_has_permission(club_id, 'overview', 'view'));

create policy "club editors can add decision history"
on public.decision_events for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.club_has_permission(club_id, 'overview', 'edit')
);

create index if not exists decision_events_club_decision_created_idx
on public.decision_events(club_id, decision_id, created_at desc);

create index if not exists decision_events_subject_idx
on public.decision_events(club_id, subject_type, subject_id, created_at desc);

notify pgrst, 'reload schema';
