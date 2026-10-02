-- Apply after club_membership.sql. No memberships, overrides or login flags changed.
begin;
create table public.club_match_drafts (
 id uuid primary key default gen_random_uuid(),
 club_id uuid not null references public.clubs(id),
 created_by uuid not null references auth.users(id),
 opponent text not null check (char_length(opponent) between 1 and 120 and opponent = btrim(opponent)),
 match_date date not null,
 objective text not null check (objective in ('attendance', 'repeat', 'partners')),
 created_at timestamptz not null default now()
);
create index club_match_drafts_recent on public.club_match_drafts(club_id, created_at desc, id desc);
alter table public.club_match_drafts enable row level security;
revoke all on public.club_match_drafts from public, anon, authenticated;
grant select on public.club_match_drafts to authenticated;
grant insert (club_id, created_by, opponent, match_date, objective) on public.club_match_drafts to authenticated;
create policy read_match_drafts on public.club_match_drafts for select to authenticated
 using (public.club_has_permission(club_id, 'matchplan', 'view'));
create policy create_match_drafts on public.club_match_drafts for insert to authenticated
 with check (created_by = (select auth.uid()) and public.club_has_permission(club_id, 'matchplan', 'edit'));
-- Immutable first increment: no update, delete, approval, delivery or export grants.
commit;
