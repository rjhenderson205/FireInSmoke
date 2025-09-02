# Fire In Smoke BBQ House

Premium dark, ember‑themed barbecue & seafood site: performant, accessible, PWA‑enhanced, and commerce‑ready.

## 🔥 Highlights
- Atmospheric hero (parallax, reduced‑motion aware)
- Data‑driven dynamic menu with graceful static fallback & skeleton loaders
- Clickable menu thumbnails (single‑image lightbox mode)
- Gallery supporting images & autoplay looped videos (keyboard navigable)
- Cart system (localStorage persistence, tax, tip, toasts, focus states)
- Delivery partners (auto‑enable when status becomes `live`)
- Structured data (JSON-LD Restaurant + menu sections)
- PWA (service worker + offline fallback page + manifest)
- Accessibility: skip link, focus traps, keyboard activation, reduced motion, high contrast
- Performance: lazy images, WebP assets, blur‑up thumbnails, minimal JS

## 📁 Project Structure (excerpt)
```
index.html
assets/
	css/styles.css
	js/main.js
	data/menu.json
	data/partners.json
	images/*.webp / *.mp4
sw.js
manifest.webmanifest
docs/
	ARCHITECTURE.md
	ACCESSIBILITY.md
	DATA_MODELS.md
	DEPLOYMENT.md
	CONTRIBUTING.md
```

## 🧩 Key Data Files
See `docs/DATA_MODELS.md` for full schemas.

| File | Purpose |
|------|---------|
| `assets/data/menu.json` | Menu sections and items (dynamic render) |
| `assets/data/partners.json` | Delivery partners + status |

Promote a partner to live:
```json
{ "name": "Uber Eats", "slug": "uber-eats", "status": "live", "url": "https://www.ubereats.com/your-store" }
```

## 🖼 Lightbox Modes
- Gallery mode: arrows + video/image support
- Single mode: used by menu thumbnails (no arrows, backdrop click closes)

## ♿ Accessibility Snapshot
Detailed checklist: `docs/ACCESSIBILITY.md`.
- Focus traps (cart, lightbox), backdrop click close
- Keyboard image/video navigation, Enter/Space activation
- Live regions for cart add/remove & form submission
- High contrast color scheme & visible focus indicators

## 🚀 Deployment
Static hosting (GitHub Pages / Netlify / Vercel). Steps & cache busting tips in `docs/DEPLOYMENT.md`.

## 🛠 Development
No build step. Open `index.html` via local server (for service worker) e.g. VS Code Live Server or simple `python -m http.server`.

### Hybrid Square Checkout (Hardened)
Backend in `server/` exposes `POST /api/create-checkout` to convert the local cart into a secure Square payment link.

Security Hardening Implemented:
- Ignores client-submitted prices; derives authoritative `basePriceCents` from `assets/data/menu.json` (items with TBD pricing are rejected).
- Validates quantity bounds (1–50) & item existence.
- Requires each item to have a mapped Square Catalog Object ID in `assets/data/square-map.json`.
- Returns dedicated error codes (`UNKNOWN_ITEM`, `UNMAPPED_ITEM`, `PRICE_UNAVAILABLE`, etc.).
- CORS restricted via `CORS_ALLOW_ORIGINS` allowlist (comma-separated).
- Optional hot reload of pricing indices guarded by `ENABLE_RELOAD=true` (dev only).
 - `/api/status` endpoint signals if payments are enabled (frontend shows "Online Ordering Coming Soon" if disabled).
 - Security headers via Helmet + basic rate limiting (120 requests / 15 min) on `/api/*`.

Current Flow:
1. Frontend builds cart from menu (no descriptions sent).
2. Checkout posts `{ cart:[{id, qty}] }` (price fields from client ignored if present).
3. Server validates items & pricing, aggregates total using internal index.
4. Server creates a Square Payment Link (Quick Pay) with an itemized note.
5. Frontend redirects user to the secure Square-hosted payment page.

Setup:
1. Create `server/.env` (see template below) with sandbox credentials first.
2. Fill real catalog IDs in `assets/data/square-map.json` (replace `null` placeholders).
3. Install deps & run backend: (inside `server/`) `npm install` then `npm run dev`.
4. Serve frontend from an allowed origin (configure `CORS_ALLOW_ORIGINS`).
5. After testing, switch `SQUARE_API_BASE` to production and use a production access token.

`.env` example:
```
SQUARE_ACCESS_TOKEN=EAAA_SANDBOX_...
SQUARE_LOCATION_ID=LOCATION_ID
SQUARE_API_BASE=https://connect.squareupsandbox.com
CORS_ALLOW_ORIGINS=http://localhost:5173,https://your-production-domain
ENABLE_RELOAD=false
```

Environment Variables:
| Var | Description |
|-----|-------------|
| SQUARE_ACCESS_TOKEN | Square access token (sandbox or prod) |
| SQUARE_LOCATION_ID  | Square location identifier |
| SQUARE_API_BASE     | API base (sandbox or production) |
| CORS_ALLOW_ORIGINS  | Comma-separated list of allowed origins |
| ENABLE_RELOAD       | If `true`, enables `/api/_reload` (dev only) |

Front-End Toggle:
Set `const HYBRID = true/false` in `assets/js/main.js` (if present) to enable / disable showing checkout UI.

Next Security Enhancements (Recommended):
- Fetch live prices & taxes from Square Catalog + Tax APIs to avoid manual duplication.
- Create Orders with line items before payment link for richer reporting.
- Webhook listener (payment completion) to enable internal fulfillment dashboard.
- Rate limiting / basic abuse protection (e.g., express-rate-limit) if public.
 - Add CSP (Content Security Policy) once domains / CDNs finalized.
 - Translate backend error codes into friendly customer messages.

### SEO / Crawl Baseline
- Added `robots.txt`, `sitemap.xml`, and custom `404.html`.
- Replace `your-production-domain` placeholders post-deploy and consider adding a canonical `<link>`.

## 🔐 Offline & Caching
`sw.js` precaches core shell + offline.html fallback. Increment cache version constant when changing critical assets.

## 🗺 Additional Documentation
| Doc | Summary |
|-----|---------|
| `docs/ARCHITECTURE.md` | Module and layout overview |
| `docs/ACCESSIBILITY.md` | A11y design & future improvements |
| `docs/DATA_MODELS.md` | JSON structures & cart model |
| `docs/DEPLOYMENT.md` | Hosting & post‑deploy checklist |
| `docs/CONTRIBUTING.md` | Workflow & standards |

## 🧪 Future Roadmap
- Square payment form integration
- Harden hybrid checkout (catalog price reconciliation, discounts, taxes via Square)
- Responsive `<picture>` sources (AVIF/WebP + fallbacks)
- Analytics events (CTA, add‑to‑cart, conversions)
- Menu item options / modifiers
- Enhanced SEO (sitemap, robots, additional schema)
- Image CDN & automatic srcset generation

## 📏 License
Proprietary (internal use). Update if distributing.

## 🙌 Credits / Notes
Crafted with performance & accessibility in mind. Request enhancements (animations, new sections, integrations) via issues or PRs. See `docs/CONTRIBUTING.md`.
