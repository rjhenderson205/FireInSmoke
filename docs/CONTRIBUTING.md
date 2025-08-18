# Contributing Guide

> Internal project currently; adapt if opened publicly.

## Workflow
1. Create a feature branch: `feat/<short-description>`
2. Make focused commits (imperative tense)
3. Open PR → include summary + screenshots/gifs for UI changes
4. Self-review: check formatting, accessibility, no console errors
5. Merge after review or self-approval if sole maintainer

## Coding Standards
- **HTML**: semantic tags first, ARIA only when needed
- **CSS**: prefer custom properties & utility classes; group related declarations logically
- **JS**: vanilla modules (IIFEs) only; no external dependencies unless justified
- Avoid global leaks (attach only deliberate globals like `__openSingleImage`)

## Accessibility Checklist (Per Change)
- Focus order remains logical
- Interactive elements keyboard reachable (Enter/Space)
- Color contrast ≥ WCAG AA
- Motion respects reduced-motion

## Performance Checklist
- Images compressed (WebP) and sized appropriately
- Lazy loading where off-screen
- Avoid layout thrash (prefer transform over top/left animations)

## Adding Menu Items
1. Update `assets/data/menu.json`
2. Provide unique `id` (snake)
3. Include `basePriceCents` or leave off for unavailable
4. If new thumbnail desired, add mapping inside dynamic menu script

## Testing Manual Scenarios
- Offline browsing (should show fallback page)
- Add-to-cart persistence (refresh retains items)
- Lightbox video + image navigation
- Mobile nav open/close & focus

## Commit Message Style
Format: `<type>: <scope> - <summary>` (optional) e.g. `feat: menu - add smoked turkey item`

Common types: feat, fix, docs, style, refactor, perf, chore

## Opening Issues (If Public)
Provide: expected vs actual, reproduction steps, environment, screenshots.

## Roadmap Tags
- `soon` (next sprint)
- `later` (backlog)
- `idea` (needs validation)
