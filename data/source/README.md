# Source artefacts

The `.xlsx` file in this folder is the current research/workbook source of truth used to design V1.

For the public web app, do **not** parse this workbook client-side.
Instead, progressively export validated tables into structured JSON under `data/seed/` or a database.

When private club data is introduced, store it outside the public repository.
