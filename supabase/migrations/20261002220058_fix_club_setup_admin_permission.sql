drop policy if exists "club admins can insert setup" on public.club_setup;
create policy "club admins can insert setup"
on public.club_setup for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'administer')
);

drop policy if exists "club admins can update setup" on public.club_setup;
create policy "club admins can update setup"
on public.club_setup for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'administer'))
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'administer')
);

notify pgrst, 'reload schema';
