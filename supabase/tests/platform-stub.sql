-- Minimal stand-in for the Supabase platform objects the migrations rely on: roles, auth.users,
-- auth.uid() and auth.jwt(). For CI and local checks only; never run against a real project.
do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if; if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if; if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if; end $$;
grant usage on schema public to anon, authenticated, service_role;
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}'::jsonb);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
create or replace function auth.role() returns text language sql stable as $$ select coalesce(auth.jwt()->>'role', 'anon') $$;
grant execute on all functions in schema auth to anon, authenticated, service_role;
create extension if not exists pgcrypto;
