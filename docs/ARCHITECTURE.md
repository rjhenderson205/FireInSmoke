# Architecture Overview

## Stack
- Static HTML, CSS, vanilla JavaScript (no build step required)
- Progressive Web App enhancements (service worker + manifest)
- Data-driven sections using JSON (menu, partners)

## High-Level Layout
```
index.html
 ├─ header (sticky, transparent -> solid on scroll)
 ├─ hero (background image, overlay, calls to action)
 ├─ highlights (feature cards)
 ├─ menu (signature + dynamic sections from menu.json)
 ├─ story (brand narrative)
 ├─ feature bands (catering, hiring)
 ├─ gallery (figures with images/videos, lightbox enabled)
 ├─ location (address, map embed)
 ├─ contact & social
 ├─ order placeholder
 └─ footer (nav, social, legal)
```

## JavaScript Modules (IIFEs)
1. Navigation / header behavior (mobile toggle, shrink on scroll, intersection fade-ins)
2. Smooth scrolling for internal anchors
3. Dynamic Menu Loader
   - Fetches `assets/data/menu.json`
   - Preserves static fallback until data loads
   - Adds skeleton shimmer placeholders
   - Enhances with thumbnails, Add buttons
4. Partners loader (fetch `partners.json`)
5. (Removed) Reservation form (previously validation & honeypot)
6. Gallery & Lightbox
   - Supports images & videos
   - Keyboard navigation, focus trap
   - Single-image mode reused for menu thumbnails
7. Cart system
   - LocalStorage persistence
   - Tip, tax, totals calculation
   - Add/remove/update with toasts & live region announcements
8. Hero parallax effect (respects reduced motion)

## Lightbox Flow
```
Click gallery item/menu thumb -> open (gallery or single mode) -> render media -> trap focus
ESC / backdrop click / close button -> teardown -> restore scroll & focus
```

## Data Model
Menu JSON structure:
```jsonc
{
  "sections": [
    { "id": "meats", "title": "Meats", "items": [
      { "id": "sausage_plate", "name": "Sausage Plate (Includes 2 sides)", "desc": "Smoked sausage with two classic sides.", "basePriceCents": 1200 }
    ] }
  ]
}
```
Partners JSON structure:
```jsonc
[
  { "name": "Uber Eats", "slug": "uber-eats", "status": "coming-soon", "url": "https://..." }
]
```

## Accessibility Features
- Skip link, ARIA roles/labels
- Focus traps (cart & lightbox)
- aria-live for form/cart feedback
- Keyboard activation (Enter/Space) on interactive figures & thumbnails
- Reduced motion media queries

## Performance Techniques
- Lazy loading images
- WebP assets
- Blur-up placeholder classes (progressive reveal)
- Skeleton loaders for menu
- Minimal JS, no heavy frameworks

## Offline / Caching Strategy
- Service worker precaches core shell & offline.html
- Network fetch for JSON data with graceful fallback to static markup

## Future Integration Points
- Square checkout (hybrid payment link – authoritative server pricing, catalog ID mapping)
- Delivery partner deep links
- Analytics events (CTA, add-to-cart, conversions)
- srcset / responsive images & streaming video optimization

## Security Considerations
- No user auth (static site)
- Removed reservation form (no PII collection)
- External links use `rel="noopener"`
- Hybrid checkout server: validates item IDs, rejects unmapped or TBD priced items, ignores client prices, CORS allowlist via env.
- Recommend: deploy behind HTTPS only; rotate Square access tokens if leaked; add rate limiting.
 - Status endpoint (`/api/status`) enables frontend to disable checkout gracefully.
 - Helmet sets baseline security headers; future CSP to be defined when asset hosts fixed.

## Deployment
Static hosting (GitHub Pages, Netlify, Vercel). Root scope required for service worker path.
