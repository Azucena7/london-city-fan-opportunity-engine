-- Contract Impact Graph: sanitized review requirements created from verified material clauses.
-- Raw clause text stays in governed contract tables; this queue can be read at overview level.

create table if not exists public.contract_impact_reviews (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  document_id uuid not null,
  clause_id uuid not null,
  entity_type text not null check (entity_type in ('sponsor','player','campaign','fixture','season','decision')),
  entity_id text not null,
  relationship_type text not null check (relationship_type in ('applies-to','blocks','requires','supersedes')),
  review_state text not null default 'pending'
    check (review_state in ('pending','acknowledged','resolved')),
  reason text not null default 'Verified material contract change affects this entity.',
  triggered_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(document_id, club_id)
    references public.contract_documents(id, club_id) on delete cascade,
  foreign key(clause_id, document_id, club_id)
    references public.contract_clauses(id, document_id, club_id) on delete cascade,
  unique(clause_id, entity_type, entity_id, relationship_type),
  check (
    (review_state='pending')
    or (reviewed_by is not null and reviewed_at is not null)
  )
);

alter table public.contract_impact_reviews enable row level security;
revoke all on public.contract_impact_reviews from anon;
grant select, insert, update on public.contract_impact_reviews to authenticated;

create policy "club members can read sanitized contract impacts"
on public.contract_impact_reviews for select to authenticated
using (public.club_has_permission(club_id,'overview','view'));

create policy "governance editors can create contract impacts"
on public.contract_impact_reviews for insert to authenticated
with check (
  public.club_has_permission(club_id,'governance','edit')
);

create policy "governance editors can update contract impacts"
on public.contract_impact_reviews for update to authenticated
using (public.club_has_permission(club_id,'governance','edit'))
with check (
  public.club_has_permission(club_id,'governance','edit')
);

create or replace function public.create_contract_impact_reviews_for_clause()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  if new.review_state='verified'
     and new.material=true
     and (TG_OP='INSERT' or old.review_state is distinct from 'verified') then
    insert into public.contract_impact_reviews (
      club_id,
      document_id,
      clause_id,
      entity_type,
      entity_id,
      relationship_type,
      reason,
      triggered_by
    )
    select
      link.club_id,
      link.document_id,
      new.id,
      link.entity_type,
      link.entity_id,
      link.relationship_type,
      'Verified material contract change affects this entity.',
      auth.uid()
    from public.contract_entity_links link
    where link.clause_id=new.id
      and link.relationship_type in ('applies-to','blocks','requires','supersedes')
    on conflict (clause_id, entity_type, entity_id, relationship_type) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.create_contract_impact_reviews_for_clause() from public, anon;
grant execute on function public.create_contract_impact_reviews_for_clause() to authenticated;

drop trigger if exists create_contract_impacts_after_clause_verification on public.contract_clauses;
create trigger create_contract_impacts_after_clause_verification
after insert or update on public.contract_clauses
for each row execute function public.create_contract_impact_reviews_for_clause();

create or replace function public.create_contract_impact_review_for_link()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
declare
  clause_verified boolean;
  clause_material boolean;
begin
  if new.clause_id is null or new.relationship_type='informs' then
    return new;
  end if;

  select
    clause.review_state='verified',
    clause.material
  into clause_verified, clause_material
  from public.contract_clauses clause
  where clause.id=new.clause_id
    and clause.document_id=new.document_id
    and clause.club_id=new.club_id;

  if clause_verified and clause_material then
    insert into public.contract_impact_reviews (
      club_id,
      document_id,
      clause_id,
      entity_type,
      entity_id,
      relationship_type,
      reason,
      triggered_by
    )
    values (
      new.club_id,
      new.document_id,
      new.clause_id,
      new.entity_type,
      new.entity_id,
      new.relationship_type,
      'Verified material contract change affects this entity.',
      auth.uid()
    )
    on conflict (clause_id, entity_type, entity_id, relationship_type) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.create_contract_impact_review_for_link() from public, anon;
grant execute on function public.create_contract_impact_review_for_link() to authenticated;

drop trigger if exists create_contract_impact_after_entity_link on public.contract_entity_links;
create trigger create_contract_impact_after_entity_link
after insert on public.contract_entity_links
for each row execute function public.create_contract_impact_review_for_link();

create or replace function public.enforce_contract_impact_review_state()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  if TG_OP='UPDATE' and old.review_state='resolved' then
    raise exception 'resolved contract impact reviews are immutable';
  end if;

  if new.review_state in ('acknowledged','resolved')
     and (TG_OP='INSERT' or old.review_state is distinct from new.review_state) then
    if new.review_state='resolved'
       and not public.club_has_permission(new.club_id,'governance','approve') then
      raise exception 'governance approve permission is required to resolve a contract impact review';
    end if;
    new.reviewed_by := auth.uid();
    new.reviewed_at := coalesce(new.reviewed_at, now());
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.enforce_contract_impact_review_state() from public, anon;
grant execute on function public.enforce_contract_impact_review_state() to authenticated;

drop trigger if exists enforce_contract_impact_review_state on public.contract_impact_reviews;
create trigger enforce_contract_impact_review_state
before insert or update on public.contract_impact_reviews
for each row execute function public.enforce_contract_impact_review_state();

create index if not exists contract_impact_reviews_club_state_idx
on public.contract_impact_reviews(club_id,review_state,created_at desc);

create index if not exists contract_impact_reviews_entity_idx
on public.contract_impact_reviews(club_id,entity_type,entity_id,review_state);

create index if not exists contract_impact_reviews_document_idx
on public.contract_impact_reviews(document_id,clause_id);

create index if not exists contract_impact_reviews_triggered_by_idx
on public.contract_impact_reviews(triggered_by);

create index if not exists contract_impact_reviews_reviewed_by_idx
on public.contract_impact_reviews(reviewed_by);

notify pgrst, 'reload schema';
