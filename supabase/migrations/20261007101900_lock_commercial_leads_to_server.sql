drop policy if exists "public can submit commercial leads" on public.commercial_leads;

revoke insert on table public.commercial_leads from anon;
revoke insert on table public.commercial_leads from authenticated;
