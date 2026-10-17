#!/usr/bin/env bash
# Applies the Supabase platform stub, the membership bootstrap and every migration, in order, to an
# empty Postgres database, so a migration that cannot run is caught before it reaches a project.
# Then runs the database behaviour checks that depend on the full schema.
# Usage: DATABASE_URL=postgres://... scripts/check-migrations.sh
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to an empty, disposable Postgres database}"
export PGOPTIONS="-c client_min_messages=warning"
run() { psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -q -f "$1"; }
run supabase/tests/platform-stub.sql
run supabase/bootstrap/club_membership.sql
count=0
for file in $(ls supabase/migrations/*.sql | sort); do
  run "$file" || { echo "::error file=$file::migration failed to apply"; exit 1; }
  count=$((count + 1))
done
echo "Applied $count migrations to a fresh database."
# Behaviour checks that only hold once every migration is in place.
for file in supabase/tests/privacy_guards.sql; do
  run "$file" || { echo "::error file=$file::database check failed"; exit 1; }
done
echo "Database checks passed."
