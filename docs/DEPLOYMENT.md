# Deployment Guide

## Prerequisites
- Code hosted in this repository
- Static hosting provider (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.)

## Build Step
No build required. All assets are already optimized static files. Optional future build could inline critical CSS & generate hashed filenames.

## Service Worker Scope
`sw.js` lives at repo root. It must be served from the site root for full-page scope. Ensure deployment keeps same path.

## GitHub Pages
1. Settings → Pages → Deploy from `main` / root.
2. After first deploy, verify network tab shows `sw.js` 200 and manifest loaded.
3. Update any absolute references if custom domain set.

## Netlify
1. New Site from Git → pick repo
2. Build command: (leave blank)
3. Publish directory: `/`
4. Add `_headers` or `_redirects` later if SPA style routing added.

## Vercel
1. Import → Framework preset: `Other`
2. Output directory `/`
3. Disable Build Command

## Cache Busting
Update asset query strings or increment `CACHE_NAME` inside `sw.js` when static assets change to ensure clients update.

## Environment Variables
None required. Future (Square payments, analytics) can be injected via inline script tags or environment replacement if build pipeline added.

## Post-Deploy Checklist
- [ ] Hero image loads fast (consider CDN)
- [ ] Service worker activates (Application tab → Service Workers)
- [ ] Offline test (toggle network offline → reload → see `offline.html`)
- [ ] Menu JSON fetch succeeds (check console)
- [ ] Lightbox opens & closes (backdrop & Esc)
- [ ] Cart add/remove persists after refresh

## SEO / Meta
- Update `og:image` with a production absolute URL
- Add real `og:url` (custom domain)
- Provide `robots.txt` & `sitemap.xml` (future enhancement)

## Security Headers (Optional CDN Config)
- `Content-Security-Policy` (tighten after deciding on analytics/payment scripts)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` to limit sensors/camera if not used

## Rollback
Since static, rollback = redeploy previous commit (Git revert or selecting prior deploy in hosting dashboard).
