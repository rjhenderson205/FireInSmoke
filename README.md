# Fire In Smoke BBQ House

Premium dark, ember‑themed barbecue & seafood site: performant, accessible, PWA‑enhanced, and commerce‑ready.

## 🔥 Highlights
- Atmospheric hero (parallax, reduced‑motion aware)
- Data‑driven dynamic menu with graceful static fallback & skeleton loaders
- Clickable menu thumbnails (single‑image lightbox mode)
- Gallery supporting images & autoplay looped videos (keyboard navigable)
- Cart system (localStorage persistence, tax, tip, toasts, focus states)
- Reservation form (honeypot, validation, aria-live updates)
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

### Hybrid Square Checkout (Beta)
Backend in `server/` exposes `POST /api/create-checkout` to transform the local cart into a Square payment link.

Flow:
1. Frontend cart (localStorage) collects items from `menu.json`.
2. Checkout button posts `{ cart:[{id,name,qty,priceCents}] }`.
3. Server maps `id` -> Square Catalog object id via `assets/data/square-map.json`.
4. Server creates Order & Payment Link (Square) and returns `checkoutUrl`.
5. Frontend redirects user to Square-hosted payment page.

Setup:
1. Copy `server/.env.example` to `server/.env` and fill `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID` (sandbox first).
2. Populate real catalog IDs in `assets/data/square-map.json`.
3. In `server/`: `npm install` then `npm run dev`.
4. Serve frontend (same origin recommended) or adjust CORS in `server.js`.

Env Vars:
| Var | Description |
|-----|-------------|
| SQUARE_ACCESS_TOKEN | Square access token (keep private) |
| SQUARE_LOCATION_ID  | Square location identifier |
| SQUARE_API_BASE     | Sandbox or prod base (defaults sandbox) |

Toggle: In `assets/js/main.js` set `const HYBRID = true/false` near checkout logic.

Security TODO: Replace client-sent `priceCents` with authoritative lookup from Square Catalog to prevent tampering.

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
