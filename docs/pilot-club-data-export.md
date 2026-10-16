# Club data export for an AVELA pilot

This is the request a club's ticketing / CRM owner receives at the start of a pilot. It describes one file, what goes in it, what must stay out of it, and what AVELA keeps afterwards. The machine-readable contract is [`data/contracts/crm-ticketing.schema.json`](../data/contracts/crm-ticketing.schema.json) (also served at `/api/contracts/crm-ticketing`).

## What to send

- **One JSON file**: an array of rows, or `{ "records": [ … ] }`.
- **One row per ticket**, not per order. An order of four tickets is four rows.
- **Scope**: the agreed pilot window (4–6 fixtures or a bounded campaign window) plus the previous season's home fixtures if the club wants repeat-attendance comparisons.
- **Refresh**: one export after each fixture in the window, or as agreed in the pilot plan.

## Fields

`*` = required. Everything else may be `null`.

| Field | Type / allowed values | Notes |
| --- | --- | --- |
| `schema_version`* | `"1.0"` | |
| `fixture_id`* | string | AVELA's fixture id, e.g. `2026-10-18-eve-h`. AVELA supplies the list. |
| `channel`* | `owned` · `partner` · `broadcast` · `paid` · `organic` · `direct` · `community` · `unknown` | How the order was attributed, if known. |
| `campaign_id`, `content_id` | string | Only if the ticketing system records them. |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` | string | As captured on the order. |
| `supporter_id_hash`* | 8–128 chars, `A–Z a–z 0–9 _ -` | See **Hashing** below. The same supporter must get the same hash in every export. |
| `order_id_hash`* | same pattern | |
| `ticket_id_hash`* | same pattern | |
| `order_timestamp`* | ISO 8601 date-time | |
| `ticket_product`* | string | The club's product name (e.g. "Adult", "Junior", "Family"). |
| `ticket_type` | `season` · `single` · `hospitality` · `complimentary` · `unknown` | Lets the club see season-ticket holder attendance. |
| `quantity`* | `1` | Always 1: one ticket per row. |
| `realised_unit_price`* | number ≥ 0 | Price actually paid, after discounts. |
| `currency`* | `"GBP"` | |
| `scan_status`* | `scanned` · `not_scanned` · `unknown` | |
| `scan_timestamp` | ISO 8601 date-time | Used only to group arrivals into bands before kickoff. |
| `postcode_sector` | e.g. `"BR2 9"` | **Sector only**, never a full postcode. |
| `first_time_buyer` | boolean | If the system knows it. |
| `consent_status`* | `consented` · `not_consented` · `unknown` | Marketing consent as held by the club. |
| `source_system`* | string | e.g. the ticketing platform's name. |
| `extracted_at`* | ISO 8601 date-time | When the export was made. |

## Must not be in the file

Names, email addresses, phone numbers, street addresses, full postcodes, dates of birth, payment or card details, or any free-text notes about a person. A file that contains a field named `name`, `first_name`, `last_name`, `email`, `phone`, `mobile`, `address`, `full_postcode`, `date_of_birth`, `dob`, `payment_details`, `card_number` or `customer_name` is rejected, and no aggregate is produced from it.

## Hashing

The club creates the three `*_hash` values on its side, before export, with a keyed hash (for example HMAC-SHA-256) and a secret key that **stays with the club** and is never shared with AVELA. Use the same key for every export in the pilot so a returning supporter can be recognised across fixtures. Encode the result as hex or base64url and keep 8–128 characters.

Hashed identifiers are pseudonymised, not anonymous: they remain personal data under UK GDPR and are covered by the data processing agreement.

## What happens to the file

- The club's authorised user (with connection-administrator rights) opens it in **Sources → Club supporter-journey aggregate**. The file is read and aggregated **in that user's browser**, the user reviews the aggregate preview, and only then uploads it; ticket rows are never uploaded.
- Only the aggregate is stored, in the club's own workspace, readable by club members with results access.
- Any breakdown or audience under **10 supporters is suppressed**, and audience sizes are **rounded to tens**, so no segment can single out a handful of people.
- AVELA never stores supporter, order or ticket rows in its repository or database.

## What the club gets back

Per fixture: sales and scans by ticket type, arrival bands before kickoff, season-ticket holder attendance, the postcode districts supporters travel from (only those with at least 10 supporters), repeat attendance between fixtures, and CRM audience definitions with rounded sizes that the club's own CRM can build and send.

## Questions to settle before the first export

- Which fixtures are in the window, and who on the club side owns the export.
- Which system the export comes from, and whether `campaign_id` / UTM fields are captured.
- How marketing consent is recorded, so `consent_status` is accurate.
- Who keeps the hashing key, and how it is stored.
