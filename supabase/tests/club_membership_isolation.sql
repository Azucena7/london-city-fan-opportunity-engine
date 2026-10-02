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
 ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'operator', true),
 ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'viewer', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$ begin
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
update public.club_memberships set active = false where user_id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;
do $$ begin
 if exists (select 1 from public.clubs) or exists (select 1 from public.club_memberships) then raise exception 'Revoked membership retained access'; end if;
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
