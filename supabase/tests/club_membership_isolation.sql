-- Run ONLY in an approved disposable/test Supabase database after migration.
-- Transaction rolls back all synthetic accounts/clubs. No production users.
begin;
insert into auth.users(id) values
 ('10000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002');
insert into public.clubs(id, name) values
 ('20000000-0000-0000-0000-000000000001', 'Synthetic club A'),
 ('20000000-0000-0000-0000-000000000002', 'Synthetic club B');
insert into public.club_memberships(club_id, user_id, role, active) values
 ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'marketing', true),
 ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'viewer', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$ begin
 if not public.club_has_permission('20000000-0000-0000-0000-000000000001','campaigns','edit') then raise exception 'Marketing edit denied'; end if;
 if public.club_has_permission('20000000-0000-0000-0000-000000000001','campaigns','approve') or public.club_has_permission('20000000-0000-0000-0000-000000000001','campaigns','launch') then raise exception 'Unexpected marketing authority'; end if;
 if exists(select 1 from public.club_permission_matrix() where club_id <> '20000000-0000-0000-0000-000000000001') then raise exception 'Matrix isolation failed'; end if;
 if (select count(*) from public.clubs) <> 1 then raise exception 'Club isolation failed'; end if;
 if exists (select 1 from public.clubs where id = '20000000-0000-0000-0000-000000000002') then raise exception 'Cross-club read allowed'; end if;
 if (select count(*) from public.club_memberships) <> 1 then raise exception 'Membership isolation failed'; end if;
 begin
   update public.club_memberships set role = 'admin';
   raise exception 'Role escalation allowed';
 exception when insufficient_privilege then null;
 end;
 begin
   insert into public.clubs(name) values ('Unauthorised');
   raise exception 'Unauthorised club creation allowed';
 exception when insufficient_privilege then null;
 end;
end $$;

reset role;
insert into public.club_member_permissions(club_id,user_id,area,action,allowed) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','campaigns','edit',false),
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','campaigns','launch',true);
set local role authenticated;
do $$ begin
 if public.club_has_permission('20000000-0000-0000-0000-000000000001','campaigns','edit') then raise exception 'Individual deny ignored'; end if;
 if not public.club_has_permission('20000000-0000-0000-0000-000000000001','campaigns','launch') then raise exception 'Explicit grant ignored'; end if;
 begin
  insert into public.club_member_permissions(club_id,user_id,area,action,allowed) values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','campaigns','export',true);
  raise exception 'Self grant allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
insert into public.club_member_permissions(club_id,user_id,area,action,allowed) values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','campaigns','view',false);
set local role authenticated;
do $$ begin
 if public.club_has_permission('20000000-0000-0000-0000-000000000001','campaigns','launch') then raise exception 'View deny bypassed'; end if;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
do $$ begin
 if not public.club_has_permission('20000000-0000-0000-0000-000000000002','results','view') then raise exception 'Viewer read denied'; end if;
 if exists(select 1 from public.club_permission_matrix() where action <> 'view') then raise exception 'Viewer write allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
reset role;
update public.club_memberships set active = false where user_id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;
do $$ begin
 if exists (select 1 from public.clubs) or exists (select 1 from public.club_memberships) or exists(select 1 from public.club_permission_matrix()) then raise exception 'Revoked membership retained access'; end if;
end $$;

reset role;
set local role anon;
do $$ begin
 begin
   perform * from public.clubs;
   raise exception 'Anonymous club read allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
select 'PASS: club isolation, read-only, individual grants/denials, revocation and escalation prevention' as verification;
