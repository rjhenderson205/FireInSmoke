import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// CORS (simple) - adjust origins in production
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS') return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8787;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || '';
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || '';
const SQUARE_API_BASE = process.env.SQUARE_API_BASE || 'https://connect.squareupsandbox.com';

// Lazy load square map (localId -> catalogObjectId)
function loadMap(){
  try {
    const p = path.join(process.cwd(),'assets','data','square-map.json');
    if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8'));
  } catch(err){ console.error('square-map load failed', err); }
  return {};
}

// Simple price fallback (will be overwritten by real Square catalog call if implemented)
function priceFromLocalCart(line){
  // Expect line.priceCents from client; for security you would ignore this and fetch real price from Square Catalog.
  return line.priceCents; // Replace with secure lookup later.
}

app.get('/api/health', (req,res)=>{
  res.json({ ok:true, time: new Date().toISOString() });
});

app.post('/api/create-checkout', async (req,res)=>{
  const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];
  if(!cart.length) return res.status(400).json({ error:'EMPTY_CART' });
  if(!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID){
    // Dev fallback: return mock URL (still allow front-end redirect for flow testing)
    return res.json({ checkoutUrl: 'https://fire-in-smoke-bbq.square.site/?mockOrder='+ Date.now() });
  }
  const map = loadMap();
  // Build order line items referencing mapped catalog IDs
  const lineItems = [];
  for(const line of cart){
    const catalogObjectId = map[line.id];
    if(!catalogObjectId){
      return res.status(400).json({ error:'UNMAPPED_ITEM', id: line.id });
    }
    const quantity = String(line.qty || 1);
    const basePriceCents = priceFromLocalCart(line);
    lineItems.push({
      name: line.name,
      quantity,
      base_price_money: { amount: basePriceCents, currency: 'USD' },
      catalog_object_id: catalogObjectId
    });
  }
  const idempotencyKey = nanoid();
  try {
    // Create order
    const orderResp = await fetch(`${SQUARE_API_BASE}/v2/orders`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${SQUARE_ACCESS_TOKEN}` },
      body: JSON.stringify({ order: { location_id: SQUARE_LOCATION_ID, line_items: lineItems }, idempotency_key: idempotencyKey })
    });
    const orderData = await orderResp.json();
    if(!orderResp.ok){
      return res.status(500).json({ error:'ORDER_CREATE_FAILED', details: orderData });
    }
    const orderId = orderData.order?.id;
    // Checkout API
    const checkoutResp = await fetch(`${SQUARE_API_BASE}/v2/online-checkout/payment-links`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${SQUARE_ACCESS_TOKEN}` },
      body: JSON.stringify({ idempotency_key: nanoid(), quick_pay: { name: 'Fire In Smoke Order', price_money: { amount: lineItems.reduce((a,l)=> a + parseInt(l.base_price_money.amount,10) * parseInt(l.quantity,10), 0), currency: 'USD' }, location_id: SQUARE_LOCATION_ID } })
    });
    const checkoutData = await checkoutResp.json();
    if(!checkoutResp.ok){
      return res.status(500).json({ error:'CHECKOUT_CREATE_FAILED', details: checkoutData });
    }
    const checkoutUrl = checkoutData?.payment_link?.url || checkoutData?.payment_link?.long_url;
    if(!checkoutUrl) return res.status(500).json({ error:'NO_CHECKOUT_URL' });
    res.json({ checkoutUrl, orderId });
  } catch(err){
    console.error(err);
    res.status(500).json({ error:'SERVER_ERROR', message: err.message });
  }
});

app.listen(PORT, ()=>{
  console.log(`[server] listening on :${PORT}`);
});
