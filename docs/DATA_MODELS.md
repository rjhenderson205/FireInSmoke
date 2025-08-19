# Data Models

## Menu (`assets/data/menu.json`)
```jsonc
{
  "sections": [
    {
      "id": "meats",
      "title": "Meats",
      "items": [
        { "id": "sausage_plate", "name": "Sausage Plate (Includes 2 sides)", "desc": "Smoked sausage with two classic sides.", "basePriceCents": 1200 }
      ]
    }
  ]
}
```
Fields:
- `sections[]` – list of menu groupings
  - `id` – machine id (snake/slug)
  - `title` – display name
  - `items[]`
    - `id` – unique id (used for cart & thumbnail mapping)
    - `name` – display name
    - `desc` – description text
    - `basePriceCents` – integer in cents (omit or null for unavailable placeholder)

## Partners (`assets/data/partners.json`)
```jsonc
[
  { "name": "Uber Eats", "slug": "uber-eats", "status": "coming-soon", "url": "https://example.com" }
]
```
Fields:
- `name` – label on button
- `slug` – simple identifier
- `status` – `coming-soon` (disabled) or `live`
- `url` – external ordering link (only used when `live`)

## Cart Line (localStorage `fis_cart`)
```jsonc
{
  "id": "sausage_plate",
  "name": "Sausage Plate (Includes 2 sides)",
  "priceCents": 1200,
  "qty": 1
}
```
Derived runtime totals:
- Subtotal = Σ(priceCents * qty)
- Tax = 8% subtotal (hard-coded)
- Tip = subtotal * selected rate (0 / 10 / 15 / 20%)
- Total = subtotal + tax + tip

## Thumbnail Mapping
Defined inline in menu rendering script; map of item id -> image filename. If no mapping, default fallback image is used.

## Extending Models
- Add `category` or `dietary` arrays to items for filtering.
- Add `options` array to items for variant pricing (modify add-to-cart logic to support nested option selection).
