drop policy if exists "members can read clubs" on public.clubs;

drop policy if exists "members can read workspaces" on public.campaign_workspaces;
create policy "campaign viewers can read workspaces"
on public.campaign_workspaces for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "editors can insert workspaces" on public.campaign_workspaces;
create policy "campaign editors can insert workspaces"
on public.campaign_workspaces for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and (
    (status <> 'approved' and public.club_has_permission(club_id, 'campaigns', 'edit'))
    or
    (status = 'approved' and public.club_has_permission(club_id, 'campaigns', 'approve'))
  )
);

drop policy if exists "editors can update workspaces" on public.campaign_workspaces;
create policy "campaign editors can update workspaces"
on public.campaign_workspaces for update
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'edit'))
with check (
  updated_by = (select auth.uid())
  and (
    (status <> 'approved' and public.club_has_permission(club_id, 'campaigns', 'edit'))
    or
    (status = 'approved' and public.club_has_permission(club_id, 'campaigns', 'approve'))
  )
);

drop policy if exists "members can read credit ledger" on public.credit_ledger;
create policy "campaign viewers can read credit ledger"
on public.credit_ledger for select
to authenticated
using (public.club_has_permission(club_id, 'campaigns', 'view'));

drop policy if exists "editors can add credit events" on public.credit_ledger;
create policy "campaign editors can add credit events"
on public.credit_ledger for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.club_has_permission(club_id, 'campaigns', 'edit')
);

drop policy if exists "members can read memberships" on public.club_members;
drop table if exists public.club_members;

drop function if exists private.is_club_member(uuid, text[]);

create index if not exists campaign_workspaces_updated_by_idx
on public.campaign_workspaces(updated_by);

create index if not exists credit_ledger_created_by_idx
on public.credit_ledger(created_by);

notify pgrst, 'reload schema';

