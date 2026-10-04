create table if not exists private.club_admin_invites (
  club_id uuid not null references public.clubs(id) on delete cascade,
  email text not null,
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (club_id, email)
);

revoke all on private.club_admin_invites from public, anon, authenticated;

create or replace function private.apply_confirmed_admin_invite()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_club uuid;
begin
  if new.email is null or new.email_confirmed_at is null then
    return new;
  end if;

  select club_id into invite_club
  from private.club_admin_invites
  where lower(email) = lower(new.email)
    and claimed_at is null
  order by created_at asc
  limit 1
  for update;

  if invite_club is null then
    return new;
  end if;

  if exists (
    select 1
    from public.club_memberships
    where club_id = invite_club
      and active
      and role = 'admin'
  ) then
    return new;
  end if;

  insert into public.club_memberships (club_id, user_id, role, active)
  values (invite_club, new.id, 'admin', true)
  on conflict (club_id, user_id)
  do update set role='admin', active=true;

  update private.club_admin_invites
  set claimed_by = new.id,
      claimed_at = now()
  where club_id = invite_club
    and lower(email) = lower(new.email)
    and claimed_at is null;

  return new;
end;
$$;

revoke all on function private.apply_confirmed_admin_invite() from public, anon, authenticated;

drop trigger if exists apply_confirmed_admin_invite on auth.users;
create trigger apply_confirmed_admin_invite
after insert or update of email_confirmed_at, email on auth.users
for each row execute function private.apply_confirmed_admin_invite();

