alter table public.club_access_requests
  drop constraint if exists club_access_requests_club_id_user_id_key;

create unique index if not exists club_access_requests_active_club_user_idx
on public.club_access_requests(club_id, user_id)
where status in ('pending','approved');

notify pgrst, 'reload schema';
