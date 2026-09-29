// Pulls new posts from the Substack RSS feed into content/journal/*.md.
// A post is skipped if any existing Markdown file already points at it (sourceUrl)
// or uses the same slug, so edits made in the CMS are never overwritten.
//
//   node tools/substack-sync.mjs            write new posts
//   node tools/substack-sync.mjs --dry-run  only list what would be added
//
// Env: SUBSTACK_FEED (default below), SUBSTACK_STATUS (published | draft, default published)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';
import domino from '@mixmark-io/domino';
import { slugify } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content/journal');
const FEED = process.env.SUBSTACK_FEED || 'https://salakoaderemi.substack.com/feed';
const STATUS = process.env.SUBSTACK_STATUS || 'published';
const DRY = process.argv.includes('--dry-run');

const canon = (u) => String(u || '').split(/[?#]/)[0].replace(/\/+$/, '');

function existing() {
  const urls = new Set(), slugs = new Set();
  if (!fs.existsSync(CONTENT)) return { urls, slugs };
  for (const f of fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md'))) {
    const { data } = matter(fs.readFileSync(path.join(CONTENT, f), 'utf8'));
    if (data.sourceUrl) urls.add(canon(data.sourceUrl));
    slugs.add(slugify(data.slug || f.replace(/\.md$/, '')));
  }
  return { urls, slugs };
}

// Substack separates paragraphs with <br> inside one <p>, often inside <em>/<strong>.
// Split every such <p> into real paragraphs, cloning inline wrappers around each piece.
function splitOnBreaks(node, doc) {
  const segs = [[]];
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeName === 'BR') { segs.push([]); continue; }
    if (child.nodeType === 1 && child.querySelector('br')) {
      const inner = splitOnBreaks(child, doc);
      inner.forEach((kids, i) => {
        const wrap = child.cloneNode(false);
        kids.forEach((k) => wrap.appendChild(k));
        if (i > 0) segs.push([]);
        segs[segs.length - 1].push(wrap);
      });
      continue;
    }
    segs[segs.length - 1].push(child);
  }
  return segs;
}

function normalise(html) {
  const doc = domino.createDocument(`<body>${html}</body>`);
  for (const p of Array.from(doc.querySelectorAll("p"))) {
    if (!p.querySelector('br')) continue;
    for (const kids of splitOnBreaks(p, doc)) {
      const np = doc.createElement('p');
      kids.forEach((k) => np.appendChild(k));
      if (np.textContent.trim() || np.querySelector('img')) p.parentNode.insertBefore(np, p);
    }
    p.parentNode.removeChild(p);
  }
  return doc.body.innerHTML;
}

function toMarkdown(html) {
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
  // Substack chrome that has no place on the site
  td.remove(['script', 'style', 'button', 'form', 'svg', 'iframe']);
  td.addRule('substackWidgets', {
    filter: (node) => /subscription-widget|button-wrapper|captioned-button|share-dialog|footnote-anchor|image-link-expand|poll-embed/.test(node.getAttribute?.('class') || ''),
    replacement: () => '',
  });
  // images are wrapped in links to the full-size file; keep just the image
  td.addRule('imageLinks', {
    filter: (node) => node.nodeName === 'A' && node.querySelector?.('img') && !node.textContent.trim(),
    replacement: (content) => content,
  });
  td.addRule('figcaption', { filter: 'figcaption', replacement: (c) => (c.trim() ? `\n\n*${c.trim()}*\n\n` : '') });
  return td.turndown(normalise(html)).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// Copy Substack-hosted images into assets/journal/<slug>/ so the site never depends on their CDN.
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
async function localise(url, slug, name) {
  if (!url || DRY) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const ext = EXT[(res.headers.get('content-type') || '').split(';')[0]] || 'jpg';
    const dir = path.join(ROOT, 'assets/journal', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.${ext}`), Buffer.from(await res.arrayBuffer()));
    return `/assets/journal/${slug}/${name}.${ext}`;
  } catch (err) {
    console.warn(`Kept remote image (${err.message}): ${url}`);
    return url;
  }
}

async function localiseBody(md, slug) {
  let n = 0;
  const found = [...md.matchAll(/!\[([^\]]*)\]\((\S+?)\)/g)];
  for (const [whole, alt, url] of found) {
    if (!/substack/.test(url)) continue;
    const local = await localise(url, slug, `image-${++n}`);
    md = md.replace(whole, `![${alt}](${local})`);
  }
  return md;
}

async function main() {
  const res = await fetch(FEED, { headers: { 'user-agent': 'aderemisalako.me journal sync' } });
  if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
  const xml = await res.text();
  const feed = new XMLParser({ ignoreAttributes: false, cdataPropName: false }).parse(xml);
  let items = feed?.rss?.channel?.item || [];
  if (!Array.isArray(items)) items = [items];

  const { urls, slugs } = existing();
  const added = [];
  for (const item of items) {
    const link = canon(item.link);
    const base = slugify(link.split('/p/')[1] || item.title);
    if (!link || urls.has(link) || slugs.has(base)) continue;

    const date = new Date(item.pubDate);
    const cover = await localise(item.enclosure?.['@_url'], base, 'cover');
    const subtitle = String(item.description || '').trim();
    const front = {
      title: String(item.title).trim(),
      slug: base,
      status: STATUS,
      date: date.toISOString().slice(0, 10),
      tag: 'Essay',
      ...(subtitle && { dek: subtitle, description: subtitle }),
      ...(cover && { cover }),
      sourceUrl: link,
    };
    const body = await localiseBody(toMarkdown(String(item['content:encoded'] || '')), base);
    added.push(front);
    if (!DRY) {
      fs.mkdirSync(CONTENT, { recursive: true });
      fs.writeFileSync(path.join(CONTENT, `${base}.md`), matter.stringify(body, front));
    }
    slugs.add(base);
  }
  console.log(added.length ? `${DRY ? 'Would add' : 'Added'} ${added.length} post(s):\n` + added.map((p) => `- ${p.title} (${p.slug})`).join('\n') : 'No new Substack posts.');
}

main().catch((err) => { console.error(err); process.exit(1); });
