Square Integration Setup (Planned)
=================================

Purpose
-------
Guide for completing Square catalog + order integration once credentials are ready. Current site operates in "Coming Soon" checkout mode until these steps are finished.

Prerequisites
-------------
1. Square account with access to Dashboard.
2. Decide whether to start in Sandbox (recommended) or Production.
3. Node.js >= 18 for server environment.
4. Populate `.env` with required keys (see below).

Environment Variables (add to server/.env)
-----------------------------------------
```
SQUARE_ENV=sandbox            # or production
SQUARE_ACCESS_TOKEN=xxxxxxxx  # Restricted token (never expose client-side)
SQUARE_LOCATION_ID=XXXXXXXXXX # One location for now
ENABLE_SQUARE_ORDERS=true     # Feature flag to turn on order flow
```

Security Notes
--------------
* Use a restricted access token limited to the Orders, Catalog, and Payments scopes actually required.
* Never send the access token to the browser. All Square calls originate server-side.
* Consider a second feature flag `SQUARE_WEBHOOK_SECRET` once webhooks are configured.

Step 1: Catalog Hygiene
-----------------------
1. In Square Dashboard create (or verify) items that match every `id` in `assets/data/square-map.json`.
2. Use one Catalog Item per logical menu item; attach one Item Variation (size) named `Standard` (or existing) that has the price.
3. Record the Variation ID (NOT the Item ID) for each.
4. Update `assets/data/square-map.json` replacing `null` values with the Variation IDs.
5. Commit the change.

Step 2: Server Mapping Load
---------------------------
Modify `server/server.js` (future patch) to:
* Load `square-map.json`.
* On checkout, translate internal item IDs -> Square variation IDs.
* Build an Orders API `createOrder` payload with `line_items` using authoritative pricing already loaded from `menu.json` (ignore any client price fields).

Step 3: Order Creation Flow
---------------------------
1. Client posts cart to `/api/checkout` (already implemented stub).
2. Server validates items & prices (already implemented) then:
   * If `ENABLE_SQUARE_ORDERS` is true, call Square Orders API `createOrder` with location + line items.
   * Receive `order.id`.
   * Option A (Deferred Payment - Recommended initially): Return a simple confirmation ID (no payment). Display "Order Received – pay at counter." (Low risk while testing.)
   * Option B (Card on File / Payment Link - Later): Use Payments API or Checkout API after initial validation.

Step 4: Payments (Optional Later)
---------------------------------
Simplest path once comfortable with orders:
1. Use Square Checkout API to generate a hosted checkout page for the total.
2. Redirect user to that hosted page.
3. Implement webhook for `payment.updated` to reconcile state.

Webhooks (Future)
-----------------
1. Configure endpoint e.g. `/api/webhooks/square`.
2. Verify via `x-square-signature` using the webhook signature key.
3. Handle events: `order.created`, `payment.updated` (filter by location & app id).
4. Maintain minimal order status store (JSON file or database later).

Testing Checklist
-----------------
* Toggle `SQUARE_ENV=sandbox` and ensure sandbox location ID is used.
* Attempt checkout with a TBD priced item (should reject).
* Attempt quantity 0 or huge quantity (reject).
* Attempt manipulating price client-side (server should override & still accept). For integrity you may compare computed total vs. client-provided total and log discrepancy.
* Confirm CORS allows only production origin.

Minimal Order Payload Example (Conceptual)
-----------------------------------------
```json
{
  "order": {
    "location_id": "LOCATION_ID",
    "line_items": [
      { "quantity": "2", "catalog_object_id": "VARIATION_ID", "base_price_money": { "amount": 1499, "currency": "USD" } }
    ]
  }
}
```

Do NOT trust client totals; always recompute from `menu.json`.

Step 5: Frontend Enablement
---------------------------
1. After server supports Square order creation, adjust the status endpoint to return `{ ordering: true }`.
2. Remove or change "Coming Soon" messaging on the checkout button.
3. Optionally surface an order confirmation number after POST success.

Rollback Plan
-------------
If a production issue occurs:
1. Set `ENABLE_SQUARE_ORDERS=false` and redeploy.
2. Status endpoint will revert to Coming Soon state automatically.

Troubleshooting
---------------
| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| 401 from Square | Bad or expired token | Regenerate restricted token |
| 404 catalog object | Variation ID mismatch | Re-copy ID from Dashboard |
| Order accepts wrong price | Price drift in Square catalog | Update local `menu.json` & redeploy |
| CORS error | Origin mismatch | Add domain to allowlist env var |

Next Hardening Ideas
--------------------
* Implement per-item inventory check before order creation.
* Add request signature (HMAC) on client->server to detect tampering (low priority since server validates anyway).
* Introduce rate limiter bucket specifically for checkout vs global.
* Add CSP report-only endpoint + nonce strategy.

Status
------
Document created ahead of actual integration. Update as integration proceeds.
