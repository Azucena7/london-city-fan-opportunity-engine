-- AVELA Contract Intelligence persistence foundation.
-- Prepared only: do not treat extraction as legal truth.
-- Raw legal documents and clauses are governed through the existing governance permission area.

create table if not exists public.contract_documents (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  contract_type text not null check (contract_type in ('sponsor','player','other')),
  subject_type text not null check (subject_type in ('sponsor','player','club','other')),
  subject_id text,
  subject_label text not null,
  title text not null,
  lifecycle_state text not null default 'detected'
    check (lifecycle_state in ('detected','extracted','reviewed','active','superseded','terminated')),
  effective_start date,
  effective_end date,
  source_system text,
  source_ref text,
  storage_ref text,
  document_hash text,
  version_label text,
  supersedes_document_id uuid references public.contract_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_end is null or effective_start is null or effective_end >= effective_start),
  unique(id, club_id)
);

create table if not exists public.contract_clauses (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  document_id uuid not null,
  clause_type text not null check (
    clause_type in (
      'rights','obligation','exclusivity','appearance','fee','approval','deadline',
      'renewal','restriction','kpi','make-good','usage','other'
    )
  ),
  clause_key text,
  label text not null,
  extracted_value jsonb not null default '{}'::jsonb,
  source_section text,
  source_fragment text,
  extraction_confidence numeric(4,3) check (
    extraction_confidence is null or (extraction_confidence >= 0 and extraction_confidence <= 1)
  ),
  review_state text not null default 'extracted'
    check (review_state in ('extracted','needs-review','verified','rejected')),
  material boolean not null default false,
  valid_from date,
  valid_to date,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  supersedes_clause_id uuid references public.contract_clauses(id),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from),
  check (
    (review_state <> 'verified')
    or (reviewed_by is not null and reviewed_at is not null)
  ),
  unique(id, club_id),
  foreign key(document_id, club_id)
    references public.contract_documents(id, club_id) on delete cascade
);

create table if not exists public.contract_season_instances (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  document_id uuid not null,
  season_key text not null,
  state text not null default 'draft' check (state in ('draft','active','closed','blocked')),
  carry_forward boolean not null default true,
  season_fields jsonb not null default '{}'::jsonb,
  counters jsonb not null default '{}'::jsonb,
  block_reason text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(document_id, season_key),
  foreign key(document_id, club_id)
    references public.contract_documents(id, club_id) on delete cascade
);

create table if not exists public.contract_entity_links (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  document_id uuid not null,
  clause_id uuid,

  entity_type text not null check (entity_type in ('sponsor','player','campaign','fixture','season','decision')),
  entity_id text not null,
  relationship_type text not null check (relationship_type in ('applies-to','blocks','requires','supersedes','informs')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(document_id, clause_id, entity_type, entity_id, relationship_type),
  foreign key(document_id, club_id)
    references public.contract_documents(id, club_id) on delete cascade,
  foreign key(clause_id, club_id)
    references public.contract_clauses(id, club_id) on delete cascade
);

alter table public.contract_documents enable row level security;
alter table public.contract_clauses enable row level security;
alter table public.contract_season_instances enable row level security;
alter table public.contract_entity_links enable row level security;

revoke all on public.contract_documents, public.contract_clauses, public.contract_season_instances, public.contract_entity_links from anon;
grant select, insert, update on public.contract_documents, public.contract_clauses, public.contract_season_instances to authenticated;
grant select, insert on public.contract_entity_links to authenticated;

create policy "governance can read contract documents"
on public.contract_documents for select to authenticated
using (public.club_has_permission(club_id,'governance','view'));

create policy "governance editors can add contract documents"
on public.contract_documents for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance editors can update contract documents"
on public.contract_documents for update to authenticated
using (public.club_has_permission(club_id,'governance','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance can read contract clauses"
on public.contract_clauses for select to authenticated
using (public.club_has_permission(club_id,'governance','view'));

create policy "governance editors can add contract clauses"
on public.contract_clauses for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance editors can update contract clauses"
on public.contract_clauses for update to authenticated
using (public.club_has_permission(club_id,'governance','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance can read contract season instances"
on public.contract_season_instances for select to authenticated
using (public.club_has_permission(club_id,'governance','view'));

create policy "governance editors can add contract season instances"
on public.contract_season_instances for insert to authenticated
with check (
  created_by=(select auth.uid())
  and updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance editors can update contract season instances"
on public.contract_season_instances for update to authenticated
using (public.club_has_permission(club_id,'governance','edit'))
with check (
  updated_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

create policy "governance can read contract entity links"
on public.contract_entity_links for select to authenticated
using (public.club_has_permission(club_id,'governance','view'));

create policy "governance editors can add contract entity links"
on public.contract_entity_links for insert to authenticated
with check (
  created_by=(select auth.uid())
  and public.club_has_permission(club_id,'governance','edit')
);

-- Prevent a normal editor from silently promoting extracted content into legal truth.
create or replace function public.enforce_contract_verification_permissions()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  if TG_TABLE_NAME = 'contract_documents' then
    if (
      new.lifecycle_state = 'active'
      or (TG_OP = 'UPDATE' and old.lifecycle_state = 'active')
    ) and not public.club_has_permission(new.club_id,'governance','approve') then
      raise exception 'governance approve permission is required to activate or alter an active contract';
    end if;
  elsif TG_TABLE_NAME = 'contract_clauses' then
    if (
      new.review_state = 'verified'
      or (TG_OP = 'UPDATE' and old.review_state = 'verified')
    ) then
      if not public.club_has_permission(new.club_id,'governance','approve') then
        raise exception 'governance approve permission is required to verify or alter a verified contract clause';
      end if;
      if new.review_state = 'verified' then
        new.reviewed_by := auth.uid();
        new.reviewed_at := coalesce(new.reviewed_at, now());
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_contract_verification_permissions() from public, anon;
grant execute on function public.enforce_contract_verification_permissions() to authenticated;

drop trigger if exists enforce_contract_document_activation on public.contract_documents;
create trigger enforce_contract_document_activation
before insert or update on public.contract_documents
for each row execute function public.enforce_contract_verification_permissions();

drop trigger if exists enforce_contract_clause_verification on public.contract_clauses;
create trigger enforce_contract_clause_verification
before insert or update on public.contract_clauses
for each row execute function public.enforce_contract_verification_permissions();

create index if not exists contract_documents_club_subject_idx
on public.contract_documents(club_id,contract_type,subject_type,subject_id,lifecycle_state);

create index if not exists contract_documents_effective_idx
on public.contract_documents(club_id,effective_start,effective_end)
where lifecycle_state='active';

create index if not exists contract_clauses_document_review_idx
on public.contract_clauses(document_id,review_state,material);

create index if not exists contract_clauses_club_type_idx
on public.contract_clauses(club_id,clause_type,review_state);

create index if not exists contract_season_instances_club_season_idx
on public.contract_season_instances(club_id,season_key,state);

create index if not exists contract_entity_links_entity_idx
on public.contract_entity_links(club_id,entity_type,entity_id);

create index if not exists contract_documents_created_by_idx on public.contract_documents(created_by);
create index if not exists contract_documents_updated_by_idx on public.contract_documents(updated_by);
create index if not exists contract_clauses_created_by_idx on public.contract_clauses(created_by);
create index if not exists contract_clauses_updated_by_idx on public.contract_clauses(updated_by);
create index if not exists contract_clauses_reviewed_by_idx on public.contract_clauses(reviewed_by);
create index if not exists contract_season_instances_created_by_idx on public.contract_season_instances(created_by);
create index if not exists contract_season_instances_updated_by_idx on public.contract_season_instances(updated_by);
create index if not exists contract_entity_links_created_by_idx on public.contract_entity_links(created_by);

notify pgrst, 'reload schema';
