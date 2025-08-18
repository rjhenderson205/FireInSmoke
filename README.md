# Fire In Smoke BBQ House

Premium, modern barbecue & seafood restaurant landing site. Focused on elevated dark, ember aesthetic; mobile‑first responsive layout; accessible markup; future ready for online ordering integrations.

## Features
- Hero with atmospheric overlay & clear CTAs
- Signature menu + Seafood Favorites subsection
- Contact & Social section (phone, email, Instagram, TikTok)
- Delivery partners placeholder (Uber Eats, Grubhub, DoorDash) ready for link activation
- Location & hours (single daily schedule) + map placeholder
- Reservation request placeholder form (progressive enhancement ready)
- Accessible navigation (skip link, ARIA labels, keyboard focus styles)
- Smooth scrolling & animated fade‑ins via IntersectionObserver
- JSON-LD structured data (Restaurant schema) for SEO & discovery
- Responsive grid + fluid typography

## Tech Stack
Pure static: HTML5, CSS (custom properties, modern layout), vanilla JS (no dependencies).

## Structure
```
index.html
assets/
  css/styles.css
  js/main.js
image0.jpg
```

## Integrations (Future)
Activate delivery partner buttons by replacing disabled anchors with real links:
```html
<a class="partner" href="https://www.ubereats.com/your-store" target="_blank" rel="noopener">Uber Eats</a>
```
Add reservation platform embed (e.g., OpenTable) within the `#reservations` section when credentials are available.

## SEO / Metadata
- Page title & description set
- Open Graph tags included
- Restaurant JSON-LD includes cuisine, menu items, hours, contact & social profiles

## Customization Tips
- Replace `image0.jpg` with optimized hero + create responsive `<source>` sets
- Adjust color palette via `:root` CSS variables
- Add additional menu sections using `.menu-subgroup`
- Provide actual pricing for items with `$—`

## Performance Notes
- Single network round trips for fonts + one hero image
- Minimal JS (~ small footprint) loaded with `defer`
- Consider adding image lazy loading & compression pipeline as site grows

## Accessibility
- Semantic headings & landmarks
- Color contrast meets WCAG AA for text on dark backgrounds
- Keyboard focus outline preserved & enhanced
- Skip link for bypassing navigation

## Deployment
Any static host (GitHub Pages, Netlify, Vercel, S3). Ensure correct caching headers for fonts & images.

## License
Proprietary (update if you intend to open source).

## Authoring Notes
Feel free to request dark wood texture or additional photography integration. Add more structured data (aggregateRating, priceRange) once real values are available.
