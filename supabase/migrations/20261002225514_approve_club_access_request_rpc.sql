create or replace function public.approve_club_access_request(
  request_id uuid,
  membership_role text
)
returns public.club_access_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  req public.club_access_requests;
begin
  if membership_role not in ('viewer','marketing','ticketing','business','communications','compliance','direction','admin') then
    raise exception 'Unsupported membership role';
  end if;

  select *
  into req
  from public.club_access_requests
  where id = request_id
    and status = 'pending'
  for update;

  if req.id is null then
    raise exception 'Pending access request not found';
  end if;

  if not public.club_has_permission(req.club_id, 'campaigns', 'administer') then
    raise exception 'Not authorised to approve this club';
  end if;

  insert into public.club_memberships (club_id, user_id, role, active)
  values (req.club_id, req.user_id, membership_role, true)
  on conflict (club_id, user_id)
  do update set role = excluded.role, active = true;

  update public.club_access_requests
  set status = 'approved',
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      requested_role = membership_role
  where id = req.id
  returning * into req;

  return req;
end;
$$;

revoke all on function public.approve_club_access_request(uuid, text) from public;
grant execute on function public.approve_club_access_request(uuid, text) to authenticated;

notify pgrst, 'reload schema';

