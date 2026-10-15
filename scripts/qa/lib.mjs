// Shared helpers for the QA journey scripts (API-level, runs against a live server).
import fs from 'node:fs';
import path from 'node:path';

export const BASE = process.env.QA_BASE_URL || 'http://localhost:3000';
export const RES = path.resolve('qa-resources');
export const STATE_FILE = path.join(RES, 'state.json');

export const loadState = () => (fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {});
export const saveState = (patch) => fs.writeFileSync(STATE_FILE, JSON.stringify({ ...loadState(), ...patch }, null, 2));

/** A browser-like actor with its own cookie jar. */
export class Actor {
  constructor(name) { this.name = name; this.cookies = new Map(); }
  _cookieHeader() { return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '); }
  async req(method, url, { json, form, headers = {}, raw } = {}) {
    const h = { ...headers };
    if (this.cookies.size) h.cookie = this._cookieHeader();
    let body;
    if (json !== undefined) { h['content-type'] = 'application/json'; body = JSON.stringify(json); }
    else if (form) body = form;
    else if (raw !== undefined) body = raw;
    const res = await fetch(url.startsWith('http') ? url : BASE + url, { method, headers: h, body, redirect: 'manual' });
    for (const sc of res.headers.getSetCookie?.() ?? []) {
      const [pair] = sc.split(';'); const i = pair.indexOf('=');
      const k = pair.slice(0, i).trim(); const v = pair.slice(i + 1).trim();
      if (/max-age=0|expires=thu, 01 jan 1970/i.test(sc) || v === '') this.cookies.delete(k); else this.cookies.set(k, v);
    }
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, headers: res.headers, text, setCookie: res.headers.getSetCookie?.() ?? [] };
  }
  get(url, o) { return this.req('GET', url, o); }
  post(url, json, o) { return this.req('POST', url, { json, ...o }); }
  patch(url, json, o) { return this.req('PATCH', url, { json, ...o }); }
  put(url, json, o) { return this.req('PUT', url, { json, ...o }); }
  del(url, o) { return this.req('DELETE', url, o); }
  async upload(filePath, { type, filename } = {}) {
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = type || ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm' }[ext] || 'application/octet-stream');
    const fd = new FormData();
    fd.append('file', new Blob([buf], { type: mime }), filename || path.basename(filePath));
    return this.req('POST', '/api/upload', { form: fd });
  }
}

export const results = [];
let phase = '';
export const section = (t) => { phase = t; console.log(`\n━━ ${t} ━━`); };
/** severity: 'critical' | 'high' | 'medium' | 'low' (used only when the check fails) */
export function check(name, cond, detail = '', severity = 'medium') {
  const ok = !!cond;
  results.push({ phase, name, ok, detail: String(detail ?? ''), severity: ok ? null : severity });
  console.log(`  ${ok ? '✓ PASS' : `✗ FAIL[${severity}]`}  ${name}${detail && !ok ? `  → ${detail}` : ''}`);
  return ok;
}
export const info = (msg) => console.log(`  ℹ ${msg}`);
export function finish(label) {
  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log(`\n══ ${label}: ${pass} passed, ${fail} failed (${results.length} checks) ══`);
  for (const r of results.filter((x) => !x.ok)) console.log(`   ✗ [${r.severity}] (${r.phase}) ${r.name} → ${r.detail}`);
  const file = path.join(RES, `results-${label.replace(/\W+/g, '-').toLowerCase()}.json`);
  fs.writeFileSync(file, JSON.stringify(results, null, 2));
  console.log(`   results saved: ${file}`);
}
