create table if not exists public.commercial_leads (
  id uuid primary key default gen_random_uuid(),
  club_name text not null check (char_length(club_name) between 2 and 120),
  role text not null check (char_length(role) between 2 and 120),
  work_email text not null check (char_length(work_email) between 5 and 254 and position('@' in work_email) > 1),
  priority text check (priority is null or char_length(priority) <= 240),
  consent boolean not null default false check (consent = true),
  source_path text check (source_path is null or char_length(source_path) <= 200),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120),
  utm_content text check (utm_content is null or char_length(utm_content) <= 120),
  created_at timestamptz not null default now()
);

alter table public.commercial_leads enable row level security;

revoke all on public.commercial_leads from anon, authenticated;
grant insert on public.commercial_leads to anon, authenticated;

drop policy if exists "public can submit commercial leads" on public.commercial_leads;
create policy "public can submit commercial leads"
on public.commercial_leads
for insert
to anon, authenticated
with check (consent = true);

notify pgrst, 'reload schema';
