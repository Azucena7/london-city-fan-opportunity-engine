-- Fresh schema: reviewed before applying. No real users or memberships seeded.
begin;
create table public.clubs (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 1 and 120),
 created_at timestamptz not null default now()
);
create table public.club_memberships (
 club_id uuid not null references public.clubs(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('admin', 'marketing', 'communications', 'ticketing', 'business', 'compliance', 'direction', 'viewer')),
 active boolean not null default false,
 created_at timestamptz not null default now(),
 primary key (club_id, user_id)
);
create index club_memberships_user_active on public.club_memberships(user_id, active);
create table public.club_role_permissions (
 role text not null check (role in ('admin', 'marketing', 'communications', 'ticketing', 'business', 'compliance', 'direction', 'viewer')),
 area text not null check (area in ('overview', 'matchplan', 'campaigns', 'calendar', 'brand', 'studio', 'audiences', 'intelligence', 'partners', 'talent', 'connections', 'governance', 'results', 'users', 'licence')),
 action text not null check (action in ('view', 'edit', 'approve', 'launch', 'export', 'administer')),
 primary key(role, area, action)
);
create table public.club_member_permissions (
 club_id uuid not null,
 user_id uuid not null,
 area text not null check (area in ('overview', 'matchplan', 'campaigns', 'calendar', 'brand', 'studio', 'audiences', 'intelligence', 'partners', 'talent', 'connections', 'governance', 'results', 'users', 'licence')),
 action text not null check (action in ('view', 'edit', 'approve', 'launch', 'export', 'administer')),
 allowed boolean not null,
 primary key(club_id, user_id, area, action),
 foreign key(club_id, user_id) references public.club_memberships(club_id, user_id) on delete cascade
);
insert into public.club_role_permissions(role, area, action) values
 ('admin', 'overview', 'view'),
 ('admin', 'overview', 'edit'),
 ('admin', 'overview', 'administer'),
 ('admin', 'matchplan', 'view'),
 ('admin', 'matchplan', 'edit'),
 ('admin', 'matchplan', 'approve'),
 ('admin', 'matchplan', 'administer'),
 ('admin', 'campaigns', 'view'),
 ('admin', 'campaigns', 'edit'),
 ('admin', 'campaigns', 'approve'),
 ('admin', 'campaigns', 'administer'),
 ('admin', 'calendar', 'view'),
 ('admin', 'calendar', 'edit'),
 ('admin', 'calendar', 'administer'),
 ('admin', 'brand', 'view'),
 ('admin', 'brand', 'edit'),
 ('admin', 'brand', 'approve'),
 ('admin', 'brand', 'administer'),
 ('admin', 'studio', 'view'),
 ('admin', 'studio', 'edit'),
 ('admin', 'studio', 'approve'),
 ('admin', 'studio', 'administer'),
 ('admin', 'audiences', 'view'),
 ('admin', 'audiences', 'edit'),
 ('admin', 'audiences', 'administer'),
 ('admin', 'intelligence', 'view'),
 ('admin', 'intelligence', 'administer'),
 ('admin', 'partners', 'view'),
 ('admin', 'partners', 'edit'),
 ('admin', 'partners', 'approve'),
 ('admin', 'partners', 'administer'),
 ('admin', 'talent', 'view'),
 ('admin', 'talent', 'edit'),
 ('admin', 'talent', 'approve'),
 ('admin', 'talent', 'administer'),
 ('admin', 'connections', 'view'),
 ('admin', 'connections', 'edit'),
 ('admin', 'connections', 'administer'),
 ('admin', 'governance', 'view'),
 ('admin', 'governance', 'edit'),
 ('admin', 'governance', 'approve'),
 ('admin', 'governance', 'administer'),
 ('admin', 'results', 'view'),
 ('admin', 'results', 'administer'),
 ('admin', 'users', 'view'),
 ('admin', 'users', 'administer'),
 ('admin', 'licence', 'view'),
 ('admin', 'licence', 'administer'),
 ('marketing', 'overview', 'view'),
 ('marketing', 'matchplan', 'view'),
 ('marketing', 'matchplan', 'edit'),
 ('marketing', 'campaigns', 'view'),
 ('marketing', 'campaigns', 'edit'),
 ('marketing', 'calendar', 'view'),
 ('marketing', 'calendar', 'edit'),
 ('marketing', 'brand', 'view'),
 ('marketing', 'studio', 'view'),
 ('marketing', 'studio', 'edit'),
 ('marketing', 'audiences', 'view'),
 ('marketing', 'audiences', 'edit'),
 ('marketing', 'intelligence', 'view'),
 ('marketing', 'partners', 'view'),
 ('marketing', 'talent', 'view'),
 ('marketing', 'governance', 'view'),
 ('marketing', 'results', 'view'),
 ('communications', 'overview', 'view'),
 ('communications', 'matchplan', 'view'),
 ('communications', 'campaigns', 'view'),
 ('communications', 'calendar', 'view'),
 ('communications', 'calendar', 'edit'),
 ('communications', 'brand', 'view'),
 ('communications', 'brand', 'edit'),
 ('communications', 'brand', 'approve'),
 ('communications', 'studio', 'view'),
 ('communications', 'studio', 'edit'),
 ('communications', 'studio', 'approve'),
 ('communications', 'intelligence', 'view'),
 ('communications', 'results', 'view'),
 ('ticketing', 'overview', 'view'),
 ('ticketing', 'matchplan', 'view'),
 ('ticketing', 'campaigns', 'view'),
 ('ticketing', 'calendar', 'view'),
 ('ticketing', 'audiences', 'view'),
 ('ticketing', 'audiences', 'edit'),
 ('ticketing', 'connections', 'view'),
 ('ticketing', 'results', 'view'),
 ('business', 'overview', 'view'),
 ('business', 'campaigns', 'view'),
 ('business', 'calendar', 'view'),
 ('business', 'intelligence', 'view'),
 ('business', 'partners', 'view'),
 ('business', 'partners', 'edit'),
 ('business', 'talent', 'view'),
 ('business', 'talent', 'edit'),
 ('business', 'results', 'view'),
 ('compliance', 'overview', 'view'),
 ('compliance', 'campaigns', 'view'),
 ('compliance', 'brand', 'view'),
 ('compliance', 'studio', 'view'),
 ('compliance', 'audiences', 'view'),
 ('compliance', 'talent', 'view'),
 ('compliance', 'talent', 'approve'),
 ('compliance', 'governance', 'view'),
 ('compliance', 'governance', 'edit'),
 ('compliance', 'governance', 'approve'),
 ('compliance', 'results', 'view'),
 ('direction', 'overview', 'view'),
 ('direction', 'matchplan', 'view'),
 ('direction', 'results', 'view'),
 ('viewer', 'overview', 'view'),
 ('viewer', 'results', 'view');
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_role_permissions enable row level security;
alter table public.club_member_permissions enable row level security;
revoke all on public.clubs, public.club_memberships, public.club_role_permissions, public.club_member_permissions from public, anon, authenticated;
grant select on public.clubs, public.club_memberships, public.club_role_permissions, public.club_member_permissions to authenticated;
create policy own_active_memberships on public.club_memberships for select to authenticated
 using (user_id = (select auth.uid()) and active);
create policy member_clubs on public.clubs for select to authenticated
 using (exists (select 1 from public.club_memberships m where m.club_id = clubs.id and m.user_id = (select auth.uid()) and m.active));
create policy role_templates on public.club_role_permissions for select to authenticated using (true);
create policy own_permission_overrides on public.club_member_permissions for select to authenticated
 using (user_id = (select auth.uid()) and exists (select 1 from public.club_memberships m where m.club_id = club_member_permissions.club_id and m.user_id = (select auth.uid()) and m.active));

create function public.club_has_permission(p_club uuid, p_area text, p_action text) returns boolean
 language sql stable security invoker set search_path = '' as $$
 select exists (
  select 1 from public.club_memberships m
  where m.club_id = p_club and m.user_id = auth.uid() and m.active
   and coalesce((select o.allowed from public.club_member_permissions o where o.club_id = p_club and o.user_id = auth.uid() and o.area = p_area and o.action = 'view'),
    exists (select 1 from public.club_role_permissions r where r.role = m.role and r.area = p_area and r.action = 'view'))
   and coalesce((select o.allowed from public.club_member_permissions o where o.club_id = p_club and o.user_id = auth.uid() and o.area = p_area and o.action = p_action),
    exists (select 1 from public.club_role_permissions r where r.role = m.role and r.area = p_area and r.action = p_action))
 );
$$;
create function public.club_permission_matrix() returns table(club_id uuid, area text, action text)
 language sql stable security invoker set search_path = '' as $$
 select m.club_id, a.area, k.action from public.club_memberships m
 cross join (values ('overview'), ('matchplan'), ('campaigns'), ('calendar'), ('brand'), ('studio'), ('audiences'), ('intelligence'), ('partners'), ('talent'), ('connections'), ('governance'), ('results'), ('users'), ('licence')) a(area)
 cross join (values ('view'), ('edit'), ('approve'), ('launch'), ('export'), ('administer')) k(action)
 where m.user_id = auth.uid() and m.active and public.club_has_permission(m.club_id, a.area, k.action);
$$;
revoke all on function public.club_has_permission(uuid, text, text), public.club_permission_matrix() from public, anon;
grant execute on function public.club_has_permission(uuid, text, text), public.club_permission_matrix() to authenticated;
-- Application users cannot change their role or overrides. No write grants.
-- Launch and export are absent from defaults; trusted administration must grant
-- them per person and area. Future domain tables must enforce this function in RLS.
commit;
