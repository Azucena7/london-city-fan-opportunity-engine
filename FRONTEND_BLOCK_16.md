# FRONTEND BLOCK 16 — Native Case Study + Full Gamma Handoff

## Goal
Make `/case-study` the fast, native explanation layer of the Fan Opportunity Lab while keeping the full 10-slide Gamma as the deep-dive editorial asset.

## Product architecture
- `This Week` = operational decision
- `Opportunities` = where + when
- `Access` = fan journey + territory access
- `Method` = model, evidence and limitations
- `Case Study` = 2–3 minute public explanation
- Full Gamma = methodology, examples and validation depth

## What changed
1. Rebuilt `/case-study` as a short narrative instead of repeating the old Story Mode.
2. Added two clear hero CTAs:
   - Explore the live prototype
   - Read the full case study
3. Native case study flow:
   - Business problem
   - Sunday-not-allegiance insight
   - Croydon 94/92 contradiction
   - 940 LSOAs → WHERE → WHEN → MATCHWEEK → ACTION → LEARN
   - Product proof / This Week operating view
   - Bigger idea / 4-person team capacity thesis
4. Added the completed Gamma link:
   `https://gamma.app/docs/kjxuybiifkup0qm`
5. Kept EN/ES behaviour.
6. Added route metadata for public sharing and search previews.
7. Added responsive case-study-specific visual hierarchy in `block16.css`.

## Deliberate choices
- Gamma is linked, not embedded. This avoids duplicating a 10-slide deck inside the product and keeps `/case-study` fast and responsive.
- The native page is intentionally shorter than the full deck.
- No new model variables, scores or APIs were added.
- The Croydon proof uses the already verified public-case-study figures only.
- The product proof is a stylised native representation of the actual `This Week` information architecture, not a fake analytics screenshot.

## Files changed
- `src/app/case-study/page.tsx`
- `src/components/LocalizedStoryPage.tsx`
- `src/app/layout.tsx`
- `src/app/block16.css`
- `FRONTEND_BLOCK_16.md`

## Recommended commit
`Integrate short case study with full Gamma deep dive`
