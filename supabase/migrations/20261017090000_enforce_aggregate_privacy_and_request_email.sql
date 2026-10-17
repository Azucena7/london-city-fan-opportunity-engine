-- Two rules that were enforced only by the app's API routes now hold in the database too, so a
-- signed-in user calling PostgREST directly cannot bypass them.
--
-- 1. Journey aggregates: the privacy rules of scripts/lib/crm-aggregate-validate.mjs that protect
--    supporters (no supporter/order/ticket keys anywhere, no small cells, origins no finer than a
--    postcode district, audiences as criteria never member lists). The route keeps the full
--    validator, including the consistency checks; this trigger is the floor beneath it.
-- 2. Access requests: the email on a request must be the requester's own sign-in email.

create or replace function private.journey_aggregate_privacy_errors(dataset jsonb)
returns text[]
language plpgsql
immutable
set search_path = ''
as $$
declare
  errors text[] := '{}';
  forbidden text[] := array['records','supporter_id_hash','order_id_hash','ticket_id_hash','name','email','phone','full_postcode','date_of_birth','payment_details'];
  threshold numeric := coalesce((dataset->'privacy'->>'smallCellThreshold')::numeric, 10);
  found_key text;
  summary jsonb;
  counts jsonb;
  cell record;
  origin record;
  district jsonb;
  audience jsonb;
begin
  -- Any forbidden key, at any depth.
  with recursive walk(value) as (
    select dataset
    union all
    select child.value
    from walk
    cross join lateral (
      select e.value from jsonb_each(case when jsonb_typeof(walk.value) = 'object' then walk.value else '{}'::jsonb end) e
      union all
      select a.value from jsonb_array_elements(case when jsonb_typeof(walk.value) = 'array' then walk.value else '[]'::jsonb end) a
    ) child
  )
  select k into found_key
  from walk, jsonb_object_keys(case when jsonb_typeof(walk.value) = 'object' then walk.value else '{}'::jsonb end) k
  where k = any(forbidden)
  limit 1;
  if found_key is not null then errors := errors || format('forbidden field %s', found_key); end if;

  if threshold < 10 then errors := errors || 'privacy.smallCellThreshold cannot be below 10'::text; end if;

  for summary in select value from jsonb_array_elements(coalesce(dataset->'fixtureSummaries', '[]'::jsonb)) loop
    for counts in select value from jsonb_each(case when jsonb_typeof(summary->'ticketTypes') = 'object' then summary->'ticketTypes' else '{}'::jsonb end) loop
      for cell in select value from jsonb_each(case when jsonb_typeof(counts) = 'object' then counts else '{}'::jsonb end) loop
        if not private.journey_safe_count(cell.value, threshold) then errors := errors || 'ticketTypes: small cell must be suppressed'::text; end if;
      end loop;
    end loop;
    for cell in select value from jsonb_each(case when jsonb_typeof(summary->'entryTiming') = 'object' then summary->'entryTiming' else '{}'::jsonb end) loop
      if not private.journey_safe_count(cell.value, threshold) then errors := errors || 'entryTiming: small cell must be suppressed'::text; end if;
    end loop;
    for origin in select value from jsonb_each(case when jsonb_typeof(summary->'origins') = 'object' then summary->'origins' else '{}'::jsonb end) loop
      continue when jsonb_typeof(origin.value) <> 'object';
      if not private.journey_safe_count(coalesce(origin.value->'supporters', 'null'::jsonb), threshold)
        or not private.journey_safe_count(coalesce(origin.value->'otherSupporters', 'null'::jsonb), threshold) then
        errors := errors || 'origins: small cell must be suppressed'::text;
      end if;
      for district in select value from jsonb_array_elements(case when jsonb_typeof(origin.value->'districts') = 'array' then origin.value->'districts' else '[]'::jsonb end) loop
        if coalesce(district->>'district', '') !~ '^[A-Z]{1,2}[0-9][A-Z0-9]?$' then
          errors := errors || 'origins are postcode districts, never finer'::text;
        end if;
        if jsonb_typeof(district->'supporters') <> 'number' or (district->>'supporters')::numeric < threshold
          or (district->>'supporters')::numeric <> trunc((district->>'supporters')::numeric) then
          errors := errors || 'districts under the small-cell threshold must not be listed'::text;
        end if;
      end loop;
    end loop;
  end loop;

  for audience in select value from jsonb_array_elements(coalesce(dataset->'audienceDefinitions', '[]'::jsonb)) loop
    if audience->>'execution' is distinct from 'club-crm' then errors := errors || 'audiences are executed in the club CRM'::text; end if;
    if audience->'criteria'->>'consent' is distinct from 'consented' then errors := errors || 'audiences are consented supporters only'::text; end if;
    if not (
      coalesce(audience->'estimatedSize', 'null'::jsonb) = 'null'::jsonb
      or (jsonb_typeof(audience->'estimatedSize') = 'number'
          and (audience->>'estimatedSize')::numeric >= threshold
          and (audience->>'estimatedSize')::numeric % 10 = 0)
    ) then
      errors := errors || 'audience estimatedSize must be null or a rounded size of at least the threshold'::text;
    end if;
    if jsonb_typeof(audience->'members') = 'array' or jsonb_typeof(audience->'supporters') = 'array' then
      errors := errors || 'audiences carry criteria, never a list of supporters'::text;
    end if;
  end loop;

  return errors;
end;
$$;

-- 0, null (suppressed) or a whole number at or above the threshold.
create or replace function private.journey_safe_count(value jsonb, threshold numeric)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select value = 'null'::jsonb
    or (jsonb_typeof(value) = 'number'
        and ((value #>> '{}')::numeric = 0
             or ((value #>> '{}')::numeric >= threshold and (value #>> '{}')::numeric = trunc((value #>> '{}')::numeric))));
$$;

create or replace function private.enforce_journey_aggregate_privacy()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  errors text[] := private.journey_aggregate_privacy_errors(new.dataset);
begin
  if cardinality(errors) > 0 then
    raise exception 'journey aggregate rejected: %', array_to_string(errors[1:5], '; ')
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_journey_aggregate_privacy on public.club_journey_aggregates;
create trigger enforce_journey_aggregate_privacy
before insert or update on public.club_journey_aggregates
for each row execute function private.enforce_journey_aggregate_privacy();

revoke all on function private.journey_aggregate_privacy_errors(jsonb) from public;
revoke all on function private.journey_safe_count(jsonb, numeric) from public;
revoke all on function private.enforce_journey_aggregate_privacy() from public;

drop policy if exists "users can request club access" on public.club_access_requests;
create policy "users can request club access"
on public.club_access_requests for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and lower(email) = lower((select auth.jwt()) ->> 'email')
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
);

notify pgrst, 'reload schema';
