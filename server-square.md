# Square Integration Backend (Scaffold)

This site is static. To process payments with Square you need a backend (serverless or server) to:
1. Create an order (Square Orders API) using authoritative pricing.
2. Create a payment with the Payments API referencing that order.
3. Return a payment token or client secret to the browser to complete card entry (Web Payments SDK) OR use Payment form to tokenize and then call backend to create payment.
4. Handle webhooks for payment.updated (status COMPLETED) to fulfill order.

## High-Level Flow
Client Cart -> POST /api/order-intent -> Server builds Order -> returns { orderId, applicationId, locationId, displayPrices }
Client mounts Square Web Payments SDK with applicationId & locationId -> collects card (token) -> POST /api/pay with { orderId, cardToken, tipCents } -> Server calls Payments API -> returns status.

## Environment Variables (example)
SQUARE_ACCESS_TOKEN=EAAA...
SQUARE_ENV=sandbox
SQUARE_LOCATION_ID=XXXXXXXX
SQUARE_APPLICATION_ID=sandbox-sq0idb-XXXX
ALLOWED_ORIGIN=https://yourdomain.example

## Example Serverless (Node) Pseudocode
```javascript
import crypto from 'crypto';
import fetch from 'node-fetch';

const base = process.env.SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
const headers = {
  'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2024-02-22'
};

export async function orderIntent(event){
  const body = JSON.parse(event.body||'{}');
  const cart = body.cart||[];
  // TODO: load authoritative menu, validate items & compute amount
  const lineItems = cart.map(l => ({
    name: l.name,
    quantity: String(l.qty),
    basePriceMoney: { amount: l.priceCents, currency: 'USD' }
  }));
  const orderReq = { order: { locationId: process.env.SQUARE_LOCATION_ID, lineItems } };
  const res = await fetch(base + '/v2/orders', { method:'POST', headers, body: JSON.stringify(orderReq) });
  const data = await res.json();
  return { statusCode: 200, body: JSON.stringify({ orderId: data.order.id, applicationId: process.env.SQUARE_APPLICATION_ID, locationId: process.env.SQUARE_LOCATION_ID }) };
}

export async function pay(event){
  const { orderId, cardToken, tipCents = 0 } = JSON.parse(event.body||'{}');
  const idempotencyKey = crypto.randomUUID();
  const payReq = {
    sourceId: cardToken,
    idempotencyKey,
    orderId,
    tipMoney: tipCents ? { amount: tipCents, currency: 'USD' } : undefined,
    locationId: process.env.SQUARE_LOCATION_ID
  };
  const res = await fetch(base + '/v2/payments', { method:'POST', headers, body: JSON.stringify(payReq) });
  const data = await res.json();
  if(!res.ok) return { statusCode:400, body: JSON.stringify(data) };
  return { statusCode:200, body: JSON.stringify({ paymentId: data.payment.id, status: data.payment.status }) };
}
```

## Web Payments SDK (client) Example
```html
<script type="module">
import { Payments } from 'https://sandbox.web.squarecdn.com/v1/square.js';
async function initSquare(orderId, applicationId, locationId){
  const payments = Payments(applicationId, locationId);
  const card = await payments.card();
  await card.attach('#card-container');
  document.getElementById('sq-pay').disabled = false;
  document.getElementById('sq-pay').addEventListener('click', async (e) => {
    e.preventDefault();
    document.getElementById('sq-pay').disabled = true;
    const result = await card.tokenize();
    if(result.status === 'OK'){
      const payRes = await fetch('/api/pay', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderId, cardToken: result.token }) });
      const data = await payRes.json();
      document.getElementById('payment-status').textContent = 'Payment ' + data.status;
    } else {
      document.getElementById('payment-status').textContent = 'Card error';
      document.getElementById('sq-pay').disabled = false;
    }
  });
}
</script>
```

## Webhook Validation
Square signs webhooks with a signature key. Validate signature per docs before trusting event data.

## Next Steps
- Build authoritative price source (no trusting client).
- Add order capacity logic (max simultaneous orders). 
- Add email receipt integration.
- Add inventory flags (isAvailable false => disable Add button).

Refer to Square docs: https://developer.squareup.com/docs
