import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // if behind proxy / hosting provider
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: false // relax for now (could craft CSP later)
}));

// Basic rate limiting for API endpoints
const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 120, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);

// CORS hardening: allowlist domains (comma-separated ORIGINS env or default localhost for dev)
const ORIGIN_ALLOWLIST = (process.env.CORS_ALLOW_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173')
  .split(',')
  .map(o=>o.trim())
  .filter(Boolean);

app.use((req,res,next)=>{
  const origin = req.headers.origin;
  if(origin && ORIGIN_ALLOWLIST.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS') return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8787;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || '';
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || '';
const SQUARE_API_BASE = process.env.SQUARE_API_BASE || 'https://connect.squareupsandbox.com';

// Load square map (localId -> catalogObjectId) and authoritative menu pricing
function loadJSON(relativePath){
  try {
    const p = path.join(process.cwd(), relativePath);
    if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8'));
  } catch(err){ console.error('Failed to load', relativePath, err); }
  return null;
}

function buildPriceIndex(){
  const menu = loadJSON(path.join('assets','data','menu.json'));
  const index = {};
  if(menu?.sections){
    for(const section of menu.sections){
      for(const item of section.items){
        if(item.basePriceCents != null){
          index[item.id] = {
            name: item.name,
            amount: item.basePriceCents,
            currency: item.currency || 'USD'
          };
        }
      }
    }
  }
  return index;
}

function loadSquareMap(){
  return loadJSON(path.join('assets','data','square-map.json')) || {};
}

// Preload indices (can be reloaded per request if hot-reload desired)
let PRICE_INDEX = buildPriceIndex();
let SQUARE_MAP = loadSquareMap();

// Optional: lightweight reload endpoint (dev only)
if(process.env.ENABLE_RELOAD === 'true'){
  app.post('/api/_reload', (req,res)=>{
    PRICE_INDEX = buildPriceIndex();
    SQUARE_MAP = loadSquareMap();
    res.json({ ok:true, reloaded:true });
  });
}

app.get('/api/health', (req,res)=>{
  res.json({ ok:true, time: new Date().toISOString() });
});

app.get('/api/status', (req,res)=>{
  const paymentsEnabled = Boolean(SQUARE_ACCESS_TOKEN && SQUARE_LOCATION_ID);
  const reasons = [];
  if(!SQUARE_ACCESS_TOKEN) reasons.push('MISSING_SQUARE_ACCESS_TOKEN');
  if(!SQUARE_LOCATION_ID) reasons.push('MISSING_SQUARE_LOCATION_ID');
  res.json({ paymentsEnabled, reasons });
});

app.post('/api/create-checkout', async (req,res)=>{
  try {
    const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];
    if(!cart.length) return res.status(400).json({ error:'EMPTY_CART' });

    // Validate each line using authoritative PRICE_INDEX
    const normalized = [];
    for(const raw of cart){
      const id = String(raw.id || '').trim();
      if(!id) return res.status(400).json({ error:'INVALID_ITEM_ID' });
      const priceInfo = PRICE_INDEX[id];
      if(!priceInfo) return res.status(400).json({ error:'UNKNOWN_ITEM', id });
      const catalogObjectId = SQUARE_MAP[id];
      if(!catalogObjectId) return res.status(400).json({ error:'UNMAPPED_ITEM', id });
      const qtyNum = parseInt(raw.qty,10) || 1;
      if(qtyNum < 1 || qtyNum > 50) return res.status(400).json({ error:'INVALID_QUANTITY', id, qty: qtyNum });
      // Reject TBD (items absent from PRICE_INDEX won't reach here; here we also guard against zero/negative) 
      if(priceInfo.amount == null) return res.status(400).json({ error:'PRICE_UNAVAILABLE', id });
      normalized.push({
        id,
        name: priceInfo.name,
        quantity: String(qtyNum),
        base_price_money: { amount: priceInfo.amount, currency: priceInfo.currency },
        catalog_object_id: catalogObjectId
      });
    }

    if(!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID){
      // Dev fallback: DO NOT expose line item pricing, but allow front-end to continue test flow
      return res.json({ checkoutUrl: 'https://fire-in-smoke-bbq.square.site/?mockOrder='+ Date.now(), unsecured: true });
    }

    // Sum authoritative total (single quick_pay link). Alternative: full Orders API (already below disabled for now)
    const total = normalized.reduce((a,l)=> a + (parseInt(l.base_price_money.amount,10) * parseInt(l.quantity,10)), 0);

    // Use Payment Link Quick Pay referencing a single aggregate amount.
    // (If you need per-line tax / reporting, switch to Orders creation first then payment link for that order.)
    const checkoutResp = await fetch(`${SQUARE_API_BASE}/v2/online-checkout/payment-links`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${SQUARE_ACCESS_TOKEN}` },
      body: JSON.stringify({
        idempotency_key: nanoid(),
        quick_pay: {
          name: 'Fire In Smoke Order',
            price_money: { amount: total, currency: 'USD' },
            location_id: SQUARE_LOCATION_ID,
            note: normalized.map(li=> `${li.quantity} x ${li.name}`).join('; ')
        }
      })
    });
    const checkoutData = await checkoutResp.json();
    if(!checkoutResp.ok){
      return res.status(500).json({ error:'CHECKOUT_CREATE_FAILED', details: checkoutData });
    }
    const checkoutUrl = checkoutData?.payment_link?.url || checkoutData?.payment_link?.long_url;
    if(!checkoutUrl) return res.status(500).json({ error:'NO_CHECKOUT_URL' });
    res.json({ checkoutUrl });
  } catch(err){
    console.error('[create-checkout]', err);
    res.status(500).json({ error:'SERVER_ERROR', message: err.message });
  }
});

app.listen(PORT, ()=>{
  console.log(`[server] listening on :${PORT}`);
});
