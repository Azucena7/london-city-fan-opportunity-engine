-- Club-scoped supporter-journey aggregates (season tickets, entry timing, origins, CRM audience
-- definitions). Aggregates only: the authorised export is processed on the uploader's device and
-- supporter, order and ticket records never reach this table. Append-only; the newest row wins.
create table if not exists public.club_journey_aggregates (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  dataset jsonb not null,
  extracted_at timestamptz,
  uploaded_by uuid not null default auth.uid() references auth.users(id),
  uploaded_at timestamptz not null default now(),
  constraint club_journey_aggregates_is_aggregate check (
    dataset->>'datasetState' = 'club-aggregate'
    and dataset->>'scope' = 'club-crm-ticketing-aggregate'
    and jsonb_typeof(dataset->'fixtureSummaries') = 'array'
    and not (dataset ? 'records')
    and octet_length(dataset::text) <= 2000000
  )
);

create index if not exists club_journey_aggregates_latest on public.club_journey_aggregates (club_id, uploaded_at desc);

alter table public.club_journey_aggregates enable row level security;
revoke all on public.club_journey_aggregates from anon;
grant select, insert on public.club_journey_aggregates to authenticated;

create policy "club members with results access can read journey aggregates"
on public.club_journey_aggregates for select
to authenticated
using (public.club_has_permission(club_id, 'results', 'view'));

create policy "club connection administrators can upload journey aggregates"
on public.club_journey_aggregates for insert
to authenticated
with check (
  uploaded_by = (select auth.uid())
  and public.club_has_permission(club_id, 'connections', 'administer')
);

notify pgrst, 'reload schema';
