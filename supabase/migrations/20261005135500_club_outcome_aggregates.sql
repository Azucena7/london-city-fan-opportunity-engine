create table if not exists public.club_outcome_aggregates (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  fixture_id text not null,
  evidence_state text not null default 'reported' check (evidence_state in ('reported','verified')),
  attendance integer check (attendance is null or attendance >= 0),
  tickets integer check (tickets is null or tickets >= 0),
  scans integer check (scans is null or scans >= 0),
  no_shows integer check (no_shows is null or no_shows >= 0),
  gross_ticket_revenue numeric(14,2) check (gross_ticket_revenue is null or gross_ticket_revenue >= 0),
  campaign_attributed_tickets integer check (campaign_attributed_tickets is null or campaign_attributed_tickets >= 0),
  repeat_cohort_base integer check (repeat_cohort_base is null or repeat_cohort_base >= 0),
  repeat_purchases integer check (repeat_purchases is null or repeat_purchases >= 0),
  source_label text not null check (char_length(source_label) between 1 and 160),
  source_ref text,
  observed_at timestamptz not null,
  note text,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (club_id, fixture_id)
);

alter table public.club_outcome_aggregates enable row level security;
revoke all on public.club_outcome_aggregates from anon;
grant select,insert,update on public.club_outcome_aggregates to authenticated;

drop policy if exists "results viewers can read club outcome aggregates" on public.club_outcome_aggregates;
create policy "results viewers can read club outcome aggregates"
on public.club_outcome_aggregates for select
to authenticated
using (
  public.club_has_permission(club_id,'results','view')
  or public.club_has_permission(club_id,'overview','view')
);

drop policy if exists "results administrators can insert club outcome aggregates" on public.club_outcome_aggregates;
create policy "results administrators can insert club outcome aggregates"
on public.club_outcome_aggregates for insert
to authenticated
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'results','administer')
);

drop policy if exists "results administrators can update club outcome aggregates" on public.club_outcome_aggregates;
create policy "results administrators can update club outcome aggregates"
on public.club_outcome_aggregates for update
to authenticated
using (public.club_has_permission(club_id,'results','administer'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'results','administer')
);

create index if not exists club_outcome_aggregates_club_observed_idx
on public.club_outcome_aggregates(club_id,observed_at desc);

create index if not exists club_outcome_aggregates_updated_by_idx
on public.club_outcome_aggregates(updated_by);

notify pgrst,'reload schema';
