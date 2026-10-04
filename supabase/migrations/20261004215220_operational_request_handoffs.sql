create table if not exists public.operational_requests (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  decision_id text not null,
  request_type text not null check (request_type in ('player','sponsor-activation','representation','operations')),
  stage text not null default 'heads-up' check (stage in ('heads-up','formal-request','confirmed','alternative','unavailable','cancelled')),
  recipient_role text not null,
  subject text not null,
  detail text,
  requirements jsonb not null default '{}'::jsonb,
  event_at timestamptz,
  due_at timestamptz,
  source_type text not null default 'user' check (source_type in ('engine','user','connector')),
  external_system text,
  external_ref text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.operational_requests enable row level security;
revoke all on public.operational_requests from anon;
grant select, insert, update on public.operational_requests to authenticated;

create policy "club members can read operational requests"
on public.operational_requests for select
to authenticated
using (public.club_has_permission(club_id, 'overview', 'view'));

create policy "club editors can add operational requests"
on public.operational_requests for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'overview', 'edit')
);

create policy "club editors can update operational requests"
on public.operational_requests for update
to authenticated
using (public.club_has_permission(club_id, 'overview', 'edit'))
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'overview', 'edit')
);

create index if not exists operational_requests_club_decision_idx
on public.operational_requests(club_id, decision_id, updated_at desc);

create index if not exists operational_requests_due_idx
on public.operational_requests(club_id, due_at)
where stage in ('heads-up','formal-request','alternative');

create index if not exists operational_requests_created_by_idx
on public.operational_requests(created_by);

create index if not exists operational_requests_updated_by_idx
on public.operational_requests(updated_by);

notify pgrst, 'reload schema';
