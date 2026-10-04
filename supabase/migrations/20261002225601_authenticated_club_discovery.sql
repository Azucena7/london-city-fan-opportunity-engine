drop policy if exists "authenticated users can discover clubs" on public.clubs;
create policy "authenticated users can discover clubs"
on public.clubs for select
to authenticated
using (
  coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) is false
);

notify pgrst, 'reload schema';

