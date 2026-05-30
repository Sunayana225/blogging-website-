import 'dotenv/config';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const endpoints = [
  { method: 'GET', path: '/api/healthz' },
  { method: 'GET', path: '/api/articles' },
  { method: 'GET', path: '/api/articles/featured' },
  { method: 'GET', path: '/api/articles/stats' },
  { method: 'GET', path: '/api/categories' },
  { method: 'GET', path: '/api/tags' },
  { method: 'GET', path: '/api/species' },
  { method: 'GET', path: '/api/portfolio' },
  { method: 'GET', path: '/api/newsletter' },
];

async function run() {
  const results = [];
  for (const e of endpoints) {
    try {
      const res = await fetch(BASE + e.path, { method: e.method });
      const text = await res.text();
      results.push({ path: e.path, status: res.status, body: text.slice(0, 200) });
    } catch (err) {
      results.push({ path: e.path, error: String(err) });
    }
  }

  // POST /api/newsletter
  try {
    const res = await fetch(BASE + '/api/newsletter', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `smoke+${Date.now()}@example.com` }),
    });
    const text = await res.text();
    results.push({ path: '/api/newsletter (POST)', status: res.status, body: text.slice(0,200) });
  } catch (err) {
    results.push({ path: '/api/newsletter (POST)', error: String(err) });
  }

  // POST /api/contact (include subject)
  try {
    const res = await fetch(BASE + '/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke', email: `smoke@${Date.now()}.example`, subject: 'Smoke', message: 'hello' }),
    });
    const text = await res.text();
    results.push({ path: '/api/contact (POST)', status: res.status, body: text.slice(0,200) });
  } catch (err) {
    results.push({ path: '/api/contact (POST)', error: String(err) });
  }

  const out = {
    ts: new Date().toISOString(),
    base: BASE,
    results,
  };
  const outText = JSON.stringify(out, null, 2);
  fs.writeFileSync('smoke-results.json', outText);
  console.log(outText);
}

run().catch((e)=>{ console.error(e); process.exit(1); });
