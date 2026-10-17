-- Database-level privacy guards: a signed-in club administrator calling PostgREST directly cannot
-- store a journey aggregate that breaks the privacy rules, nobody can file an access request under
-- someone else's email, and the club list is not discoverable. Runs after every migration; raises
-- on the first failure.
begin;

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000a001', 'Admin@Club.test'),
  ('00000000-0000-0000-0000-00000000a002', 'fan@example.test');
insert into public.clubs(id, name) values ('00000000-0000-0000-0000-00000000c001', 'Privacy test club');
insert into public.club_memberships(club_id, user_id, role, active)
values ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a001', 'admin', true);

set local role authenticated;

do $$
declare
  base jsonb := '{"datasetState":"club-aggregate","scope":"club-crm-ticketing-aggregate","extractedAt":"2026-10-19T09:00:00Z","privacy":{"smallCellThreshold":10}}';
  safe jsonb := base || '{"fixtureSummaries":[{"fixtureId":"f1","entryTiming":{"early":0,"late":null,"mid":40},"ticketTypes":{"adult":{"tickets":60}},"origins":{"home":{"supporters":50,"otherSupporters":null,"districts":[{"district":"E14","supporters":20}]}}}],"audienceDefinitions":[{"id":"a","execution":"club-crm","criteria":{"consent":"consented"},"estimatedSize":30}]}';
  unsafe jsonb[] := array[
    base || '{"fixtureSummaries":[{"fixtureId":"f1","entryTiming":{"early":3}}]}',
    base || '{"fixtureSummaries":[{"fixtureId":"f1","ticketTypes":{"hospitality":{"tickets":4}}}]}',
    base || '{"fixtureSummaries":[{"fixtureId":"f1","nested":[{"email":"someone@example.test"}]}]}',
    base || '{"fixtureSummaries":[{"fixtureId":"f1","origins":{"home":{"supporters":20,"districts":[{"district":"E14 9GE","supporters":20}]}}}]}',
    base || '{"fixtureSummaries":[{"fixtureId":"f1","origins":{"home":{"supporters":20,"districts":[{"district":"E14","supporters":4}]}}}]}',
    base || '{"fixtureSummaries":[],"audienceDefinitions":[{"id":"a","execution":"club-crm","criteria":{"consent":"consented"},"estimatedSize":30,"members":[]}]}',
    base || '{"fixtureSummaries":[],"audienceDefinitions":[{"id":"a","execution":"club-crm","criteria":{"consent":"consented"},"estimatedSize":7}]}',
    jsonb_set(base, '{privacy,smallCellThreshold}', '2') || '{"fixtureSummaries":[{"fixtureId":"f1","entryTiming":{"early":3}}]}'
  ];
  dataset jsonb;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', true);
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000a001","email":"admin@club.test"}', true);

  insert into public.club_journey_aggregates(club_id, dataset) values ('00000000-0000-0000-0000-00000000c001', safe);

  foreach dataset in array unsafe loop
    begin
      insert into public.club_journey_aggregates(club_id, dataset) values ('00000000-0000-0000-0000-00000000c001', dataset);
      raise exception 'Privacy guard failed: stored %', dataset;
    exception when check_violation then null;
    end;
  end loop;

  begin
    insert into public.club_access_requests(club_id, user_id, email)
    values ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a001', 'ceo@club.test');
    raise exception 'Privacy guard failed: access request stored under another email';
  exception when insufficient_privilege then null;
  end;

  -- The sign-in email, in any case, is accepted.
  insert into public.club_access_requests(club_id, user_id, email)
  values ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a001', 'ADMIN@club.test');
end;
$$;

-- A user with no membership sees no club until they request one through its link, then only that one.
reset role;
insert into public.clubs(id, name) values ('00000000-0000-0000-0000-00000000c002', 'Other test club');
set local role authenticated;
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', true);
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000a002","email":"fan@example.test"}', true);
  if exists (select 1 from public.clubs) then raise exception 'Club list is discoverable without membership'; end if;
  insert into public.club_access_requests(club_id, user_id, email)
  values ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a002', 'fan@example.test');
  if (select array_agg(id) from public.clubs) is distinct from array['00000000-0000-0000-0000-00000000c001'::uuid] then
    raise exception 'A requester should see only the club they requested';
  end if;
end;
$$;

rollback;
