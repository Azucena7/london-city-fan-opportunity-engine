-- Club venues and their capacity, entered once in Club setup.
-- Club-level operating context only: no supporter, order or ticket data belongs here.
alter table public.club_setup
  add column if not exists venues jsonb not null default '[]'::jsonb;

alter table public.club_setup
  drop constraint if exists club_setup_venues_is_array;

alter table public.club_setup
  add constraint club_setup_venues_is_array
  check (jsonb_typeof(venues) = 'array' and jsonb_array_length(venues) <= 10);

comment on column public.club_setup.venues is
  'Configured venues: name, aliases, home flag, total and sellable capacity, capacity state (club-confirmed | public-reported | missing), source and as-of date.';
