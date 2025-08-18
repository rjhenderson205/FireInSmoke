# Fire In Smoke BBQ House

Premium, modern barbecue & seafood restaurant landing site. Focused on elevated dark, ember aesthetic; mobile‑first responsive layout; accessible markup; future ready for online ordering integrations.

## Features
- Hero with atmospheric overlay & clear CTAs
- Data-driven menu (fetches `assets/data/menu.json`)
- Seafood Favorites subsection
- Contact & Social section (phone, email, Instagram, TikTok)
- Delivery partners dynamic buttons (reads `assets/data/partners.json`)
- Gallery with lightbox modal (keyboard + focus trap)
- Reservation form with validation, honeypot, aria-live feedback
- PWA basics: `manifest.webmanifest`, service worker caching core shell, offline fallback
- Structured data (Restaurant JSON-LD)
- Accessible navigation (skip link, ARIA labels, reduced motion support)
- Smooth scrolling & animated fade‑ins (IntersectionObserver)
- Responsive grid + fluid typography

## Data Files
`assets/data/menu.json` – sections & items (null price => placeholder).  
`assets/data/partners.json` – partner name, slug, status (`coming-soon` | `live`) and URL.

Update a partner to live:
```json
{ "name": "Uber Eats", "slug": "uber-eats", "status": "live", "url": "https://www.ubereats.com/your-store" }
```
Buttons auto-enable with proper link.

## Lightbox
Gallery placeholders become interactive; replace each `.g-item` with `<img data-gallery-item data-src="/path" alt="..."/>` when images ready. Lightbox currently reuses `image0.jpg` as placeholder.

## PWA / Offline
Service worker (`sw.js`) precaches core assets and serves `offline.html` when network missing. Increment `CACHE_NAME` in `sw.js` when deploying new versions.

## Accessibility
- Focus trap in lightbox
- `aria-live` region for form submission states
- Honeypot invisible to assistive tech (visually hidden off-canvas)
- Reduced motion respects `prefers-reduced-motion`.

## Performance Notes
- Add optimized hero and gallery images (WebP/AVIF) later with `<source>`.
- Consider inlining critical CSS (above-the-fold) in production build.

## Deployment
Static hosting (GitHub Pages, Netlify, Vercel). Ensure service worker path stays at root.

## Next Ideas
- Real image assets & responsive sources
- Ordering platform deep links
- Analytics events for conversions
- Additional structured data (geo, priceRange, aggregateRating)

## License
Proprietary (update if you intend to open source).

## Authoring Notes
Feel free to request dark wood texture or additional photography integration. Add more structured data (aggregateRating, priceRange) once real values are available.
