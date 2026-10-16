# Data processing agreement — outline for an AVELA club pilot

> **Draft for review by the club's and AVELA's legal advisers. This is not legal advice and not a signed agreement.** Items in `[brackets]` must be completed or confirmed before signature.

This outline lists what the agreement needs to cover for the pilot data flow described in [`pilot-club-data-export.md`](pilot-club-data-export.md). It follows UK GDPR Article 28 and the Data Protection Act 2018.

## 1. Parties and roles

- **Controller**: `[Club legal name, company number, address]`, which decides why and how supporter data is used.
- **Processor**: `[AVELA legal entity, company number, address]`, which processes it only on the club's documented instructions.
- **Contacts**: each party names a data protection contact. `[Names / emails]`

## 2. Subject matter, duration and purpose

- **Purpose**: to measure the pilot's agreed decisions: attendance, repeat attendance, arrival timing and supporter origins for the pilot fixtures, and to define CRM audiences the club itself sends to.
- **Duration**: the pilot window `[dates]` plus the close-out review, then deletion (section 8).
- **Excluded purposes**: no profiling of individuals, no automated decisions about individuals, no selling or sharing of data, no use to train models, and no use for any other club or customer.

## 3. Data

- **Categories of data subjects**: ticket buyers and attendees of the pilot fixtures `[and previous-season home fixtures, if agreed]`.
- **Personal data**: pseudonymised supporter, order and ticket identifiers (keyed hashes made by the club), order and scan timestamps, ticket product and type, price paid, postcode sector, first-time-buyer flag, marketing-consent status, and attribution fields (channel, campaign, UTM).
- **Not processed**: names, contact details, full postcodes, addresses, dates of birth, payment data or special-category data. The import rejects files that contain them.
- **Hashing key**: kept by the club and never disclosed to AVELA, so AVELA cannot reverse the identifiers.

## 4. Where and how it is processed

- The export is read and aggregated **in the authorised club user's browser**. Row-level data is not uploaded to AVELA.
- Only aggregates are stored, with small cells under 10 suppressed and audience sizes rounded to tens.
- **Hosting of stored aggregates**: Supabase, project region `[confirm region]`. **Web application**: Vercel `[confirm region / data handling]`.
- **International transfers**: `[confirm whether any processing leaves the UK/EEA and the transfer mechanism, e.g. UK IDTA or Addendum]`.

## 5. Sub-processors

| Sub-processor | Role | Data |
| --- | --- | --- |
| Supabase | Database and authentication for the club workspace | Aggregates; club user accounts |
| Vercel | Hosting of the web application | Club user sessions; no ticket rows |
| `[Resend]` | Email delivery of the Morning Read, if enabled | Recipient email addresses of club staff; no supporter data |

AVELA must give `[30]` days' notice of a new or replaced sub-processor, and the club may object.

## 6. Security

- Access is limited to named club users, with per-club, role-based permissions enforced in the database (row-level security).
- Data is encrypted in transit (TLS) and at rest, using the providers' encryption.
- Credentials are kept in the hosting providers' secret stores, never in code.
- `[Add: access review cadence, MFA requirement for club admins, logging.]`

## 7. Processor obligations (Article 28)

AVELA must:
- process only on documented instructions;
- ensure confidentiality of authorised personnel;
- assist the club with data-subject requests and impact assessments;
- notify the club of a personal-data breach without undue delay, and within `[24/48]` hours of becoming aware, so the club can meet its 72-hour duty;
- make available the information needed to demonstrate compliance, and allow audits `[scope / notice]`;
- not attempt to re-identify any individual.

## 8. Return and deletion

At the end of the pilot, or on the club's request, AVELA deletes the stored aggregates for the club within `[30]` days and confirms in writing. Nothing is retained for other purposes. The club may export its aggregates first.

## 9. Measurement boundary

Results are reported as measured, observed or missing. Campaign identifiers alone are not presented as proof of additional sales, and no causal impact is claimed without the measurement design agreed in the pilot plan.

## 10. To complete before signature

- [ ] Legal entities and contacts
- [ ] Pilot dates and fixture list
- [ ] Supabase and Vercel regions and any transfer mechanism
- [ ] Breach-notice window and audit terms
- [ ] Club DPIA, if the club's own policy requires one
