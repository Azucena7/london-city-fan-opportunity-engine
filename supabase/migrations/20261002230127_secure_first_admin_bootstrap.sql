create schema if not exists private;

create table if not exists private.club_bootstrap_tokens (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  token_hash text not null,
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

revoke all on private.club_bootstrap_tokens from public, anon, authenticated;

create table if not exists public.club_bootstrap_claims (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.club_bootstrap_claims enable row level security;
revoke all on public.club_bootstrap_claims from anon;
grant insert on public.club_bootstrap_claims to authenticated;

drop policy if exists "users can submit own bootstrap claim" on public.club_bootstrap_claims;
create policy "users can submit own bootstrap claim"
on public.club_bootstrap_claims for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) is false
);

create or replace function private.process_club_bootstrap_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_hash text;
  existing_admin_count integer;
begin
  if (select auth.uid()) is null or new.user_id <> (select auth.uid()) then
    raise exception 'Authenticated user mismatch';
  end if;

  select count(*) into existing_admin_count
  from public.club_memberships
  where club_id = new.club_id
    and active
    and role = 'admin';

  if existing_admin_count > 0 then
    raise exception 'Club already has an active admin';
  end if;

  select token_hash into expected_hash
  from private.club_bootstrap_tokens
  where club_id = new.club_id
    and claimed_at is null
  for update;

  if expected_hash is null or expected_hash <> new.token_hash then
    raise exception 'Invalid or expired bootstrap code';
  end if;

  insert into public.club_memberships (club_id, user_id, role, active)
  values (new.club_id, new.user_id, 'admin', true)
  on conflict (club_id, user_id)
  do update set role='admin', active=true;

  update private.club_bootstrap_tokens
  set claimed_by = new.user_id,
      claimed_at = now()
  where club_id = new.club_id;

  return new;
end;
$$;

revoke all on function private.process_club_bootstrap_claim() from public, anon, authenticated;

drop trigger if exists process_club_bootstrap_claim on public.club_bootstrap_claims;
create trigger process_club_bootstrap_claim
before insert on public.club_bootstrap_claims
for each row execute function private.process_club_bootstrap_claim();

create index if not exists club_bootstrap_claims_user_idx
on public.club_bootstrap_claims(user_id);

notify pgrst, 'reload schema';

