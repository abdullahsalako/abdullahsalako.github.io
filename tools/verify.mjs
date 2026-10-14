#!/usr/bin/env node
// Checks that the site is healthy after a change. No dependencies.
//   node tools/verify.mjs             static checks + blog build reproducibility
//   node tools/verify.mjs --browser   also loads key pages in headless Chromium (needs playwright-core or playwright)
import { readFileSync, existsSync, statSync, readdirSync, mkdtempSync, cpSync, symlinkSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const ok = (msg) => console.log(`  ok    ${msg}`);
const fail = (msg) => { failures.push(msg); console.log(`  FAIL  ${msg}`); };
const read = (f) => readFileSync(path.join(ROOT, f), 'utf8');

function files(dir, test, out = []) {
  for (const name of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (['node_modules', '.git'].includes(name.name)) continue;
    const rel = path.join(dir, name.name);
    if (name.isDirectory()) files(rel, test, out); else if (test(rel)) out.push(rel);
  }
  return out;
}

// Public pages: everything except redirect stubs, the CMS, demos and the experiments folder.
const pages = files('.', (f) => f.endsWith('.html') && !/^(admin|journal|experiments|addons|tools\/node_modules)\b/.test(f) && !f.startsWith('google'))
  .map((f) => f.replace(/^\.\//, ''));
const redirectStubs = ['article.html', 'notices.html'];

console.log('JavaScript syntax');
for (const f of ['script.js', 'intro.js', ...files('addons', (x) => x.endsWith('.js')), ...files('tools', (x) => x.endsWith('.mjs') && !x.includes('node_modules'))]) {
  try { execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' }); ok(f); } catch (e) { fail(`${f}: ${String(e.stderr).split('\n')[0]}`); }
}

console.log('CSS braces');
for (const f of ['styles.css', 'theme.css', 'addons/addons.css']) {
  const css = read(f).replace(/\/\*[\s\S]*?\*\//g, '');
  const [o, c] = [css.split('{').length - 1, css.split('}').length - 1];
  o === c ? ok(`${f} (${o} blocks)`) : fail(`${f}: ${o} "{" vs ${c} "}"`);
}

console.log('Page wiring');
for (const f of pages) {
  const h = read(f);
  const stub = redirectStubs.includes(f);
  const problems = [];
  if (!/href="\/?theme\.css"/.test(h)) problems.push('missing theme.css');
  if (!stub) {
    if (!/addons\/addons\.css/.test(h) || !/addons\/addons\.js/.test(h)) problems.push('missing addons css/js');
    if (!/script\.js\?v=\d+/.test(h)) problems.push('missing versioned script.js');
    if (!/family=Jost/.test(h) || !/family=Inter/.test(h)) problems.push('fonts link is not Inter + Jost');
  }
  if (/Fraunces/.test(h)) problems.push('still loads Fraunces');
  if (/data-ao="[^"]*curtain/.test(h) || /curtain:\s*true/.test(h)) problems.push('page-transition curtain switched on');
  problems.length ? fail(`${f}: ${problems.join(', ')}`) : ok(f);
}
if (/if\s*\(\s*ON\.curtain\s*\)/.test(read('addons/addons.js'))) fail('addons.js calls the retired curtain');

console.log('Local links and images');
const broken = new Set();
for (const f of [...pages, ...files('experiments', (x) => x.endsWith('.html'))]) {
  for (const m of read(f).replace(/<!--[\s\S]*?-->/g, '').matchAll(/(?:href|src)="([^"#?]+)/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/|\{\{)/.test(u) || u === '/') continue;
    const p = u.startsWith('/') ? u.slice(1) : path.join(path.dirname(f), u);
    if (![p, `${p}.html`, `${p}/index.html`].some((c) => existsSync(path.join(ROOT, c)) && statSync(path.join(ROOT, c)).isFile())) broken.add(`${f} -> ${u}`);
  }
}
broken.size ? [...broken].forEach((b) => fail(`broken reference ${b}`)) : ok(`${pages.length} pages, all references resolve`);

console.log('Blog build is reproducible');
try {
  const tmp = mkdtempSync(path.join(tmpdir(), 'verify-site-'));
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT }).toString().split('\0').filter(Boolean);
  for (const f of tracked) if (existsSync(path.join(ROOT, f))) cpSync(path.join(ROOT, f), path.join(tmp, f), { recursive: true });
  symlinkSync(path.join(ROOT, 'tools/node_modules'), path.join(tmp, 'tools/node_modules'));
  execFileSync(process.execPath, ['tools/build.mjs'], { cwd: tmp, stdio: 'pipe' });
  const changed = tracked.filter((f) => existsSync(path.join(ROOT, f)) && statSync(path.join(ROOT, f)).isFile() && readFileSync(path.join(ROOT, f)).compare(readFileSync(path.join(tmp, f))) !== 0);
  rmSync(tmp, { recursive: true, force: true });
  changed.length ? fail(`running the build would change: ${changed.join(', ')}`) : ok('node tools/build.mjs leaves the repo unchanged');
} catch (e) { fail(`blog build could not run: ${String(e.stderr || e.message).split('\n')[0]}`); }

if (process.argv.includes('--browser')) await browserChecks();

async function browserChecks() {
  console.log('Browser smoke test');
  let chromium;
  const spec = process.env.PLAYWRIGHT_MODULE ? pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE)).href : 'playwright-core';
  try { ({ chromium } = await import(spec).catch(() => import('playwright'))); } catch { console.log('  skip  playwright-core/playwright is not installed (set PLAYWRIGHT_MODULE to its index.mjs)'); return; }
  const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', mp4: 'video/mp4', svg: 'image/svg+xml' };
  const server = createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
    const hit = [p || 'index.html', `${p}.html`, `${p}/index.html`].map((c) => path.join(ROOT, c)).find((c) => existsSync(c) && statSync(c).isFile());
    if (!hit) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': types[hit.split('.').pop()] || 'application/octet-stream' }).end(readFileSync(hit));
  }).listen(0);
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const expect = { '/': {}, '/about': {}, '/services': {}, '/contact': {}, '/blog/': {}, '/portfolio': { decks: 2 }, '/films': { tiles: 1 }, '/photography': { tiles: 1 } };
  for (const [url, want] of Object.entries(expect)) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());          // fonts, analytics: not needed
    await page.addInitScript(() => sessionStorage.setItem('rv-intro', '1'));   // skip the name-writing opening
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await page.mouse.move(300, 300); await page.mouse.move(340, 320);
    const r = await page.evaluate(() => ({
      cursor: !!document.querySelector('.ao-cursor'), progress: !!document.querySelector('.ao-progress'),
      curtain: !!document.querySelector('.ao-curtain'), nav: !!document.querySelector('.site-nav a.on, .site-nav a[aria-current]'),
      decks: document.querySelectorAll('.deck-stage').length, tiles: document.querySelectorAll('.tile-grid .tile').length,
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    const bad = [];
    if (errors.length) bad.push(`script errors: ${errors[0]}`);
    if (!r.cursor || !r.progress) bad.push('cursor dot / progress line missing');
    if (r.curtain) bad.push('page-transition curtain present');
    if (r.overflow > 0) bad.push(`sideways scroll (${r.overflow}px)`);
    if (want.decks && r.decks !== want.decks) bad.push(`expected ${want.decks} card decks, found ${r.decks}`);
    if (want.tiles && r.tiles < want.tiles) bad.push('no gallery tiles');
    bad.length ? fail(`${url}: ${bad.join('; ')}`) : ok(url);
    await page.close();
  }
  await browser.close(); server.close();
}

console.log(failures.length ? `\n${failures.length} problem(s) found.` : '\nAll checks passed.');
process.exit(failures.length ? 1 : 0);
