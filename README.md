# London City Fan Opportunity Engine

A public-facing decision engine exploring a practical question:

> Where are London City Lionesses' next recurring spectators, and what should the club do to acquire them?

This repository is designed as both:
1. a **LinkedIn/public demo** of practical AI applied to women's football; and
2. a future **operational decision layer** for matchday acquisition, ticketing and commercial activation.

## Core thesis

Women's football clubs often operate with smaller commercial and marketing teams. AI can give a four-person team capabilities that previously required a much larger analytics, research and activation function.

The engine does not start with AI. It starts with a club problem:

- Where are the most attractive fan territories?
- Which grassroots organisations can distribute to families?
- How hard is it to reach Hayes Lane on matchday?
- What women's-football alternatives compete locally?
- Which fixtures create calendar whitespace?
- What else competes for attention that day?
- How should weather alter the campaign?
- Which ticket product should be offered?
- Which local partners/channels can distribute it?
- Did the campaign create repeat attendance?

## V1 modules

- Territory Opportunity
- Grassroots Network
- Matchday Access
- Competition Landscape
- Calendar Whitespace
- Attention Competition
- Weather Monitor
- Attendance Monitor
- Ticketing Strategy
- Local Market / Consumer Trends
- Matchday Experience Audit
- Weekly Decision Engine
- Post-match Learning Loop

## Primary output

The operational output is a **Weekly Matchday Decision Card**:

- target territory
- territory opportunity
- calendar whitespace
- attention pressure
- weather suitability
- attendance momentum
- fixture appeal
- recommended product
- recommended channel
- recommended campaign message
- ATTACK / TEST / DEFEND decision
- KPI and post-match learning

## Repository structure

- `docs/` - product, data, scoring, UX and automation specifications
- `data/seed/` - starter JSON for the public prototype
- `data/source/` - current research workbook / source artefacts
- `src/` - frontend implementation placeholder
- `automations/` - future data ingestion / agent workflows
- `public/` - static public assets

## Recommended stack

Frontend:
- Next.js + TypeScript
- Tailwind CSS
- MapLibre or Leaflet for mapping
- Recharts for charts

Data / backend:
- Phase 1: static JSON committed to GitHub
- Phase 2: Supabase / Postgres
- Phase 3: scheduled ingestion jobs / agents

Deployment:
- GitHub -> Vercel

## Public demo principle

AI is infrastructure, not the protagonist. Every page should lead with the football/business decision.

