insert into public.delivery_effort_events
  (id, club_id, fixture_id, item_id, event_key, event_type, units, note, created_by, created_at)
select
  id, club_id, fixture_id, item_id, event_key, event_type, credits, note, created_by, created_at
from public.credit_ledger
on conflict do nothing;

drop table public.credit_ledger;

notify pgrst, 'reload schema';
