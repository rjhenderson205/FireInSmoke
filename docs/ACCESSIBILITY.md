# Accessibility Guide

This project aims for an inclusive, keyboard and screen-reader friendly experience.

## Landmarks & Structure
- Semantic sections (`header`, `main`, `section`, `footer`)
- Skip link: `.skip-link` jumps to `#main`
- ARIA labels on navigation & dialogs

## Keyboard Support
| Component | Keys | Behavior |
|-----------|------|----------|
| Nav menu toggle | Enter / Space | Open / close mobile nav |
| Gallery / Lightbox | Arrow Left/Right | Navigate media |
| Lightbox / Cart | Escape | Close dialog |
| Lightbox / Cart | Tab / Shift+Tab | Trapped within active dialog |
| Menu thumbnails | Enter / Space | Enlarge image |

## Focus Management
- Opening dialogs (cart, lightbox) moves focus to first control
- Closing returns focus to the triggering element
- Focus outlines preserved; custom `:focus-visible` styles for clarity

## Live Regions
- `.sr-live` (polite updates for form & cart actions)
- Toast region uses aria-live for ephemeral status (non-blocking)

## Forms
- Honeypot field (`company`) traps simple bots; off-screen & `aria-hidden`

## Media
- All meaningful images have `alt` text
- Decorative background images use CSS or empty alt
- Videos inside lightbox have controls and loop (ensure no critical info conveyed solely through motion)

## Reduced Motion
- Uses `@media (prefers-reduced-motion: reduce)` to disable non-essential transitions & parallax

## Color & Contrast
- Dark theme with high contrast text (#fff on near-black)
- Hover/focus states increase contrast and show underlines/indicators

## Future Improvements
- Add skip links to cart & gallery regions directly
- Provide captions/descriptions for videos
- Add ARIA `current` markers in navigation based on scroll position
- Add focus outline enhancements for partner buttons once live
