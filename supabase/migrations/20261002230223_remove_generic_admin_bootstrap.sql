drop trigger if exists process_club_bootstrap_claim on public.club_bootstrap_claims;
drop function if exists private.process_club_bootstrap_claim();
drop table if exists public.club_bootstrap_claims;
drop table if exists private.club_bootstrap_tokens;
notify pgrst, 'reload schema';

