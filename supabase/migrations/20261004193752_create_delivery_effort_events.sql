create table if not exists public.delivery_effort_events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  fixture_id text,
  item_id text,
  event_key text unique,
  event_type text not null check (event_type in ('commit','release','consume','adjust')),
  units integer not null check (units > 0),
  note text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.delivery_effort_events enable row level security;

revoke all on public.delivery_effort_events from anon;
grant select, insert on public.delivery_effort_events to authenticated;

drop policy if exists "campaign viewers can read delivery effort events" on public.delivery_effort_events;
create policy "campaign viewers can read delivery effort events"
on public.delivery_effort_events for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "campaign editors can add delivery effort events" on public.delivery_effort_events;
create policy "campaign editors can add delivery effort events"
on public.delivery_effort_events for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'edit')
);

create index if not exists delivery_effort_events_club_created_idx
on public.delivery_effort_events(club_id, created_at desc);

create index if not exists delivery_effort_events_created_by_idx
on public.delivery_effort_events(created_by);

insert into public.delivery_effort_events
  (id, club_id, fixture_id, item_id, event_key, event_type, units, note, created_by, created_at)
select
  id, club_id, fixture_id, item_id, event_key, event_type, credits, note, created_by, created_at
from public.credit_ledger
on conflict (event_key) do nothing;

notify pgrst, 'reload schema';
