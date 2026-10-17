-- A signed-in user sees only the clubs they belong to, plus a club they have a pending access
-- request for (they already hold its invitation link). The club list is no longer discoverable:
-- access is requested through a link a club admin shares.
drop policy if exists "authenticated users can discover clubs" on public.clubs;
drop policy if exists "members and requesters can read their clubs" on public.clubs;
create policy "members and requesters can read their clubs"
on public.clubs for select
to authenticated
using (
  exists (
    select 1 from public.club_memberships m
    where m.club_id = clubs.id and m.user_id = (select auth.uid()) and m.active
  )
  or exists (
    select 1 from public.club_access_requests r
    where r.club_id = clubs.id and r.user_id = (select auth.uid()) and r.status = 'pending'
  )
);

notify pgrst, 'reload schema';
