revoke execute on function public.approve_club_access_request(uuid, text) from anon;
revoke execute on function public.approve_club_access_request(uuid, text) from public;
grant execute on function public.approve_club_access_request(uuid, text) to authenticated;
notify pgrst, 'reload schema';
