# SEO checklist for new content

Use this every time you add a project, a journal post or a new page.

## Adding a project (case study)

1. Copy `work/red-eye-effect/` to `work/<short-slug>/` (lowercase, hyphens,
   e.g. `work/brand-film-lumina/`).
2. In the new `index.html`, update:
   - `<title>`: 60 characters or fewer, the project name plus what it is,
     e.g. "Lumina: Luxury Brand Spot Edit & Colour Grade".
   - `meta description`: 150–160 characters covering what it is, your role,
     tools (DaVinci Resolve), and "Abuja" or "Nigeria" if it reads naturally.
   - `canonical`, `og:url`, and every `https://aderemisalako.me/work/...` in the
     JSON-LD: the new URL, **with the trailing slash**.
   - `og:image` and the schema `thumbnailUrl`: a 1920×1080 JPG poster.
   - JSON-LD `VideoObject`: `name`, `description`, `uploadDate` (ISO date),
     `duration` (e.g. `PT1M30S`), and either `contentUrl` (a self-hosted file)
     or `embedUrl` (a YouTube/Vimeo embed URL).
   - Page text: brief, approach, role, focus, deliverable, outcome. Name the
     tools you actually used and a concrete result (views, client feedback,
     turnaround) when you have one.
3. Export a WebP poster (about 1600 px wide, under 100 KB) plus the JPG
   (for sharing previews).
4. In `script.js`, add or update the project in `projects` with
   `url: '/work/<short-slug>/'` so the portfolio lightbox links to it.
5. Link to it from at least one other page: the homepage "Selected work", the
   Portfolio "Case studies" list, or a related service or journal post.
6. Add it to `sitemap.xml` (with `<lastmod>`) and to `sitemap.html`.

## Adding a journal post

1. Copy `journal/node-workflow/` to `journal/<slug>/`.
2. Update the title, description, canonical, og tags, `article:published_time`,
   the `BlogPosting` JSON-LD (`headline`, `description`, `url`,
   `datePublished`, `image`), the kicker tag, H1, date and read time.
3. Write the body as HTML in the page itself: `<p>`, `<h2>`, `<blockquote>`,
   and `<img … alt="…" width height loading="lazy">`.
4. Add a row to `journal/index.html` (use `<h2>`, and link with the trailing
   slash).
5. Link to a related service or case study from inside the post.
6. Add it to `sitemap.xml` and `sitemap.html`.

## Adding any new page

- [ ] Exactly one `<h1>`, then `<h2>`/`<h3>` in order.
- [ ] Unique `<title>` of 60 characters or fewer, and a 150–160 character description.
- [ ] `canonical` and `og:url` set to the final URL (a folder page ends in `/`;
      a root `page.html` is `/page` with no slash).
- [ ] Same header nav and footer as the other pages, and the Google Analytics
      snippet (copy it from any page's `<head>`).
- [ ] Any new "Hire me" or "Start a project" button has
      `data-hire-cta="<where-it-sits>"` so its clicks are tracked.
- [ ] Every `<img>` has descriptive `alt`, `width` and `height`. Anything below
      the fold has `loading="lazy"`.
- [ ] Images are WebP, sized to at most twice their displayed width.
- [ ] Videos are embedded from YouTube/Vimeo, not committed to the repo.
- [ ] Added to `sitemap.xml` and `sitemap.html`.

## After publishing

- [ ] Search Console → URL Inspection → Request indexing for the new URL.
- [ ] Rich Results Test on any page with `VideoObject` or `BlogPosting`.
- [ ] Monthly in Search Console: Pages (indexing errors), Performance (which
      queries bring impressions), and Core Web Vitals.
- [ ] Share the new URL on LinkedIn/X. Links and early clicks help it get found.
