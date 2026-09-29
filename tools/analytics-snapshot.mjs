// Daily analytics snapshot: GA4 + Search Console -> a private Google Sheet.
//
// The 9am report agent reads the sheet, so it never needs Google credentials.
// Runs in GitHub Actions (.github/workflows/analytics-snapshot.yml). The repo is
// public and so are its Action logs, so this script never prints any numbers,
// page paths or queries — only whether each step worked.
//
// Env (set as GitHub secrets / variables):
//   GOOGLE_SERVICE_ACCOUNT_JSON  service-account key JSON (secret)
//   GA4_PROPERTY_ID              numeric GA4 property ID, e.g. 512345678
//   ANALYTICS_SHEET_ID           ID of the Google Sheet to write to
//   GSC_SITE_URL                 optional; auto-detected (sc-domain:aderemisalako.me or https://aderemisalako.me/)
//   ANALYTICS_TIMEZONE           optional; default Africa/Lagos
//   GOOGLE_API_ORIGIN            test only: send every Google API call to this origin instead

import crypto from 'node:crypto';

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');
const TZ = process.env.ANALYTICS_TIMEZONE || 'Africa/Lagos';
const DOMAIN = 'aderemisalako.me';
const LEAD_EVENTS = ['email_click', 'hire_click', 'social_click'];
// referrers that are AI assistants or AI search
const AI_SOURCE = /chatgpt|openai|perplexity|gemini|bard\.google|claude\.ai|anthropic|copilot|bing\.com\/chat|you\.com|phind|deepseek|meta\.ai|grok|x\.ai|mistral|poe\.com|kagi/i;

const api = (url) => (process.env.GOOGLE_API_ORIGIN ? url.replace(/^https:\/\/[^/]+/, process.env.GOOGLE_API_ORIGIN) : url);
const log = (msg) => console.log(msg);

// ---------- auth: service-account JWT -> access token (no dependencies) ----------
async function accessToken() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  const key = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const tokenUri = key.token_uri || 'https://oauth2.googleapis.com/token';
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: key.client_email, scope: SCOPES, aud: tokenUri, iat: now, exp: now + 3600 })}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const res = await fetch(api(tokenUri), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`token request failed (${res.status})`);
  return (await res.json()).access_token;
}

let TOKEN;
async function call(url, { method = 'GET', body } = {}) {
  const res = await fetch(api(url), {
    method,
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let reason = '';
    try { reason = (await res.json())?.error?.status || ''; } catch {}
    throw new Error(`${method} ${new URL(url).hostname} failed (${res.status}${reason ? ' ' + reason : ''})`);
  }
  return res.status === 204 ? {} : res.json();
}

// ---------- dates ----------
function localDate(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const stamp = () => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

// ---------- GA4 ----------
const RANGES = [
  { name: 'yesterday', startDate: 'yesterday', endDate: 'yesterday' },
  { name: 'day_before', startDate: '2daysAgo', endDate: '2daysAgo' },
  { name: 'last7', startDate: '7daysAgo', endDate: 'yesterday' },
  { name: 'prev7', startDate: '14daysAgo', endDate: '8daysAgo' },
];
const RANGE_LABELS = ['Yesterday', 'Day before', 'Last 7 days', 'Previous 7 days'];

async function ga(property, body) {
  return call(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, { method: 'POST', body });
}
const num = (v) => Number(v || 0);
const pct = (a, b) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)}%` : a ? 'new' : '—');

async function gaSection(property) {
  const rows = [];
  // overview per range: users, sessions, views
  const overview = await ga(property, {
    dateRanges: RANGES,
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
  });
  const byRange = Object.fromEntries(RANGES.map((r) => [r.name, [0, 0, 0]]));
  for (const row of overview.rows || []) {
    const range = row.dimensionValues?.[0]?.value || 'yesterday';
    byRange[range] = row.metricValues.map((m) => num(m.value));
  }
  // lead events per range
  const events = await ga(property, {
    dateRanges: RANGES,
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: LEAD_EVENTS } } },
  });
  const ev = Object.fromEntries(RANGES.map((r) => [r.name, Object.fromEntries(LEAD_EVENTS.map((e) => [e, 0]))]));
  for (const row of events.rows || []) {
    const [name, range = 'yesterday'] = row.dimensionValues.map((d) => d.value);
    if (ev[range]) ev[range][name] = num(row.metricValues[0].value);
  }

  rows.push(['GA4 OVERVIEW', ...RANGE_LABELS, 'Week vs previous week']);
  const metric = (label, get) => {
    const vals = RANGES.map((r) => get(r.name));
    rows.push([label, ...vals, pct(vals[2], vals[3])]);
    return vals;
  };
  const users = metric('Users', (r) => byRange[r][0]);
  const sessions = metric('Sessions', (r) => byRange[r][1]);
  const views = metric('Page views', (r) => byRange[r][2]);
  const email = metric('Email clicks (email_click)', (r) => ev[r].email_click);
  const hire = metric('Hire me / Start a project clicks (hire_click)', (r) => ev[r].hire_click);
  const social = metric('YouTube / Instagram clicks (social_click)', (r) => ev[r].social_click);
  rows.push([]);

  const last7 = [{ startDate: '7daysAgo', endDate: 'yesterday' }];
  const pages = await ga(property, {
    dateRanges: last7,
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });
  rows.push(['TOP PAGES (last 7 days)', 'Views', 'Users']);
  for (const r of pages.rows || []) rows.push([r.dimensionValues[0].value, ...r.metricValues.map((m) => num(m.value))]);
  if (!pages.rows?.length) rows.push(['(no page views yet)']);
  rows.push([]);

  const sources = await ga(property, {
    dateRanges: last7,
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  });
  rows.push(['TRAFFIC SOURCES (last 7 days)', 'Channel', 'Sessions', 'Users', 'AI assistant?']);
  for (const r of sources.rows || []) {
    const [src, channel] = r.dimensionValues.map((d) => d.value);
    rows.push([src, channel, ...r.metricValues.map((m) => num(m.value)), AI_SOURCE.test(src) ? 'yes' : '']);
  }
  if (!sources.rows?.length) rows.push(['(no sessions yet)']);
  rows.push([]);

  // AI referrals over 28 days (sources are few, so fetch all and filter here)
  const ai = await ga(property, {
    dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    limit: 500,
  });
  const aiRows = (ai.rows || []).filter((r) => AI_SOURCE.test(r.dimensionValues[0].value));
  rows.push(['AI ASSISTANT REFERRALS (last 28 days)', 'Sessions']);
  for (const r of aiRows) rows.push([r.dimensionValues[0].value, num(r.metricValues[0].value)]);
  if (!aiRows.length) rows.push(['(none yet)']);
  const aiYesterday = await ga(property, {
    dateRanges: [{ startDate: 'yesterday', endDate: 'yesterday' }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    limit: 500,
  });
  const aiSessionsYesterday = (aiYesterday.rows || []).filter((r) => AI_SOURCE.test(r.dimensionValues[0].value)).reduce((s, r) => s + num(r.metricValues[0].value), 0);
  rows.push([]);

  const leads = await ga(property, {
    dateRanges: last7,
    dimensions: [{ name: 'eventName' }, { name: 'pagePath' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: LEAD_EVENTS } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20,
  });
  rows.push(['LEAD CLICKS BY PAGE (last 7 days)', 'Page', 'Clicks']);
  for (const r of leads.rows || []) rows.push([...r.dimensionValues.map((d) => d.value), num(r.metricValues[0].value)]);
  if (!leads.rows?.length) rows.push(['(none yet)']);
  rows.push([]);

  return {
    rows,
    history: { users: users[0], sessions: sessions[0], views: views[0], email: email[0], hire: hire[0], social: social[0], ai: aiSessionsYesterday },
  };
}

// ---------- Search Console ----------
async function gscSite() {
  if (process.env.GSC_SITE_URL) return process.env.GSC_SITE_URL;
  const { siteEntry = [] } = await call('https://www.googleapis.com/webmasters/v3/sites');
  const mine = siteEntry.filter((s) => s.siteUrl.includes(DOMAIN) && s.permissionLevel !== 'siteUnverifiedUser');
  const pick = mine.find((s) => s.siteUrl.startsWith('sc-domain:')) || mine[0];
  if (!pick) throw new Error('the service account cannot see aderemisalako.me in Search Console yet');
  return pick.siteUrl;
}

async function gscSection() {
  const site = await gscSite();
  const q = (body) => call(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: 'POST', body });
  // Search Console data lags 2–3 days, so the week ends 3 days ago
  const end = localDate(-3), start = localDate(-9), pEnd = localDate(-10), pStart = localDate(-16);
  const [cur, prev, queries, pages, day] = await Promise.all([
    q({ startDate: start, endDate: end }),
    q({ startDate: pStart, endDate: pEnd }),
    q({ startDate: start, endDate: end, dimensions: ['query'], rowLimit: 20 }),
    q({ startDate: start, endDate: end, dimensions: ['page'], rowLimit: 10 }),
    q({ startDate: end, endDate: end }),
  ]);
  const tot = (r) => r.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const fmt = (r) => [r.clicks, r.impressions, `${(r.ctr * 100).toFixed(1)}%`, r.position ? r.position.toFixed(1) : '—'];
  const rows = [];
  rows.push([`SEARCH CONSOLE (${start} to ${end}; data lags ~3 days)`, 'Clicks', 'Impressions', 'CTR', 'Avg position']);
  rows.push(['This week', ...fmt(tot(cur))]);
  rows.push([`Previous week (${pStart} to ${pEnd})`, ...fmt(tot(prev))]);
  rows.push([]);
  rows.push(['TOP SEARCH QUERIES', 'Clicks', 'Impressions', 'CTR', 'Avg position']);
  for (const r of queries.rows || []) rows.push([r.keys[0], ...fmt(r)]);
  if (!queries.rows?.length) rows.push(['(no search impressions yet)']);
  rows.push([]);
  rows.push(['TOP PAGES IN GOOGLE SEARCH', 'Clicks', 'Impressions', 'CTR', 'Avg position']);
  for (const r of pages.rows || []) rows.push([r.keys[0], ...fmt(r)]);
  if (!pages.rows?.length) rows.push(['(none yet)']);
  rows.push([]);
  const d = tot(day);
  return { rows, site, history: { date: end, clicks: d.clicks, impressions: d.impressions, position: d.position ? Number(d.position.toFixed(1)) : '' } };
}

// ---------- Sheets ----------
const HISTORY_HEADER = ['Date', 'Users', 'Sessions', 'Page views', 'Email clicks', 'Hire clicks', 'Social clicks', 'AI assistant sessions', 'Search date', 'Search clicks', 'Search impressions', 'Avg position'];

async function ensureTabs(sheetId) {
  const meta = await call(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties`);
  const tabs = (meta.sheets || []).map((s) => s.properties);
  const requests = [];
  const first = tabs[0];
  if (!tabs.some((t) => t.title === 'Latest')) {
    // rename the default first tab rather than leaving an empty "Sheet1"
    if (first && /^(Sheet1|Feuille 1|Hoja 1|Blatt1)$/.test(first.title) && tabs.length === 1) {
      requests.push({ updateSheetProperties: { properties: { sheetId: first.sheetId, title: 'Latest' }, fields: 'title' } });
    } else {
      requests.push({ addSheet: { properties: { title: 'Latest', index: 0 } } });
    }
  }
  if (!tabs.some((t) => t.title === 'History')) requests.push({ addSheet: { properties: { title: 'History' } } });
  if (requests.length) await call(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, { method: 'POST', body: { requests } });
}

async function writeSheet(sheetId, latest, historyRow) { // historyRow null = skip history
  await ensureTabs(sheetId);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`;
  await call(`${base}/${encodeURIComponent('Latest!A:Z')}:clear`, { method: 'POST', body: {} });
  const width = Math.max(...latest.map((r) => r.length), 1);
  const values = latest.map((r) => [...r, ...Array(width - r.length).fill('')]);
  await call(`${base}/${encodeURIComponent('Latest!A1')}?valueInputOption=RAW`, { method: 'PUT', body: { values } });

  const hist = await call(`${base}/${encodeURIComponent('History!A:A')}`);
  const dates = (hist.values || []).map((r) => r[0]);
  if (!dates.length) {
    await call(`${base}/${encodeURIComponent('History!A1')}?valueInputOption=RAW`, { method: 'PUT', body: { values: [HISTORY_HEADER] } });
  }
  if (historyRow && !dates.includes(historyRow[0])) {
    await call(`${base}/${encodeURIComponent('History!A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', body: { values: [historyRow] } });
    return true;
  }
  return false;
}

// ---------- main ----------
async function main() {
  const property = process.env.GA4_PROPERTY_ID;
  const sheetId = process.env.ANALYTICS_SHEET_ID;
  if (!sheetId) throw new Error('ANALYTICS_SHEET_ID is not set');
  TOKEN = await accessToken();
  log('Signed in with the service account.');

  const latest = [
    [`Site analytics for ${DOMAIN}`, `Updated ${stamp()} (${TZ})`],
    ['Written daily by the "Analytics snapshot" GitHub Action. Do not edit: the Latest tab is replaced every run; History gets one row per day.'],
    [],
  ];
  const problems = [];
  let gaPart = null, gscPart = null;

  if (!property) problems.push('GA4_PROPERTY_ID is not set, so GA4 was skipped.');
  else {
    try { gaPart = await gaSection(property); log('GA4: ok'); }
    catch (err) { problems.push(`GA4 failed: ${err.message}. Check the service account has Viewer access to the GA4 property and the Google Analytics Data API is enabled.`); log('GA4: failed'); }
  }
  try { gscPart = await gscSection(); log('Search Console: ok'); }
  catch (err) { problems.push(`Search Console failed: ${err.message}. Check the service account is a user on the Search Console property and the Search Console API is enabled.`); log('Search Console: failed'); }

  if (problems.length) { latest.push(['PROBLEMS']); problems.forEach((p) => latest.push([p])); latest.push([]); }
  if (gaPart) latest.push(...gaPart.rows);
  if (gscPart) latest.push(...gscPart.rows);

  const h = gaPart?.history || {}, s = gscPart?.history || {};
  const historyRow = [localDate(-1), h.users ?? '', h.sessions ?? '', h.views ?? '', h.email ?? '', h.hire ?? '', h.social ?? '', h.ai ?? '', s.date ?? '', s.clicks ?? '', s.impressions ?? '', s.position ?? ''];
  // an empty row would block today's real row if a later re-run succeeds
  const added = await writeSheet(sheetId, latest, gaPart || gscPart ? historyRow : null);
  log(`Sheet updated${added ? ' (history row added)' : gaPart || gscPart ? ' (history row for this date already existed)' : ' (no history row: no data source worked)'}.`);
  if (!gaPart && !gscPart) process.exit(1);
}

main().catch((err) => { console.error(`Analytics snapshot failed: ${err.message}`); process.exit(1); });
