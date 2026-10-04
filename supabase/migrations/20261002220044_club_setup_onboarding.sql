create table if not exists public.club_setup (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  fixture_source text not null default 'manual' check (fixture_source in ('manual','calendar-feed','ticketing')),
  connected_channels text[] not null default '{}',
  priority_objectives text[] not null default '{}',
  brand_rules jsonb not null default '{}'::jsonb,
  approval_rules jsonb not null default '{}'::jsonb,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.club_setup enable row level security;
revoke all on public.club_setup from anon;
grant select, insert, update on public.club_setup to authenticated;

create policy "club members can read setup"
on public.club_setup for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

create policy "club admins can insert setup"
on public.club_setup for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'admin')
);

create policy "club admins can update setup"
on public.club_setup for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'admin'))
with check (
  updated_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'admin')
);

notify pgrst, 'reload schema';
