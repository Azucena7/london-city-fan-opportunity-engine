drop policy if exists own_active_memberships on public.club_memberships;
drop policy if exists "club admins can read memberships" on public.club_memberships;
create policy "members and club admins can read memberships"
on public.club_memberships for select
to authenticated
using (
  (user_id = (select auth.uid()) and active)
  or public.club_has_permission(club_id, 'campaigns', 'administer')
);

drop policy if exists member_clubs on public.clubs;
drop policy if exists "authenticated users can discover clubs" on public.clubs;
create policy "authenticated users can discover clubs"
on public.clubs for select
to authenticated
using (coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) is false);

create index if not exists club_access_requests_reviewed_by_idx
on public.club_access_requests(reviewed_by);

create index if not exists club_setup_updated_by_idx
on public.club_setup(updated_by);

notify pgrst, 'reload schema';

