# SEO audit — aderemisalako.me

Audited 29 Sep 2026 against the repository. The live site was not reachable
from the audit environment, so status codes and speed were checked on a local
copy served the way GitHub Pages serves it (extensionless URLs, folder
`index.html` pages, `404.html`).

The site is plain HTML, CSS and JavaScript with `.nojekyll`, so there is no
Jekyll build and no `jekyll-seo-tag` plugin. Everything that plugin would
generate (titles, canonicals, Open Graph, JSON-LD, sitemap) is written by hand
in each page.

## What was wrong, and what changed

| # | Issue found | Impact | Fix applied |
|---|---|---|---|
| 1 | All seven case studies were one JavaScript template at `/project?project=…`, listed separately in `sitemap.xml`. The HTML Google first receives says "Project title". Six are concept treatments with stock (Unsplash) posters and a stand-in clip. | High: thin or duplicate pages; real work not indexable on its own URL | Red Eye Effect now has a static page at `/work/red-eye-effect/` with full text and `VideoObject` + `CreativeWork` + `BreadcrumbList` schema. `project.html` is `noindex, follow`, and old `?project=Red Eye Effect` links forward to the new page. The concept pages are out of the sitemap. |
| 2 | Journal post text was rendered only by JavaScript from `script.js`. | High: the best keyword content (the DaVinci Resolve article) was invisible without JS | Both posts are now static HTML with `BlogPosting` schema, `<time>` dates and publish-date meta. The JS renderer was removed. |
| 3 | Canonicals, the sitemap and internal links pointed at `/journal`, `/journal/<post>`. GitHub Pages answers those with a 301 to the trailing-slash URL. | Medium: canonical and sitemap URLs redirect | Folder pages now use `/journal/`, `/journal/node-workflow/`, `/journal/27-in-retrospect/`, `/work/red-eye-effect/` everywhere. |
| 4 | Homepage had only a hero: no services, no work, no clear hire CTA. The H1 was a tagline without name, role or location. | High for "video editor Abuja", "freelance video editor Nigeria" and similar searches | New H1: "Aderemi A. Salako · Video Editor, Colourist & Content Strategist · Abuja, Nigeria" (styled as the small kicker line; the display tagline is kept visually). Added Services, Selected work and a "Start a project" CTA section, plus "Hire me / View portfolio" buttons. |
| 5 | No Services page. | High: nothing to rank for "YouTube video editor", "colour grading" or "content strategy" | New `/services` page covering YouTube editing, short-form, DaVinci Resolve grading, content strategy, motion/Fusion, and subtitles/audio, plus "How I work". Anchors (`#youtube-editing` and so on) are linked from the homepage. |
| 6 | Titles like "About \| Remi Visuals" carried no keywords; descriptions were short or generic. | Medium | Every indexable page has a unique title of 60 characters or fewer and a keyword-bearing description (homepage 160, case study 155). |
| 7 | Homepage hero started at `opacity:0` (scroll-reveal) and the LCP image was a 230 KB JPEG. | Medium: slower LCP | Hero no longer uses reveal. Headshot served as WebP (23 KB) via `<picture>` with preload. Local mobile test: LCP ≈ 0.3–0.5 s, CLS 0. |
| 8 | Showreel thumbnails were 90–200 KB JPEGs. | Medium | Converted to WebP (22–91 KB, about 60% smaller), with `width`/`height`, `loading="lazy"` and `decoding="async"`. |
| 9 | Nav inconsistent: journal index listed "Showreel" twice, and footers differed page to page. | Low–medium | One nav on every page: Portfolio, Services, Journal, About, Contact. One footer: Home, Portfolio, Services, Journal, About, Contact, Sitemap, LinkedIn, X. |
| 10 | Heading order skipped levels (About h1 → h3; journal rows used h3 under h1). | Low | Fixed to h1 → h2 → h3. |
| 11 | Alt text was generic ("Portrait") or empty on meaningful images. | Low–medium | Descriptive alts on the headshot, case-study poster, gallery photos and journal images. |
| 12 | Person schema lacked image, description and skills; there was no business entity. | Medium | Homepage `@graph`: `WebSite` + `Person` (jobTitle, image, knowsAbout, Abuja/NG address, sameAs) + `ProfessionalService` (areaServed Nigeria and worldwide, offers). About has `ProfilePage`; Services has an `OfferCatalog`. |
| 13 | No HTML sitemap; `sitemap.xml` had no `lastmod` and listed query-string URLs. | Low | New `/sitemap` page linked from every footer. `sitemap.xml` lists the 10 indexable URLs with `lastmod`. |
| 14 | `robots.txt` allowed everything, including a strategy `.docx` at the site root. | Low | Crawling of `/docs/` and `*.docx` is now blocked; everything public stays allowed. |
| 15 | 404 page only linked to the journal. | Low | Links to Home, Portfolio, Services, Contact and Sitemap. |

Checked after the changes: all 14 HTML pages load with no JavaScript errors
and no sideways scroll at 375 px. Every internal link and every absolute URL
in canonicals, Open Graph tags and schema resolves to a real file. Every
JSON-LD block parses.

## Still needs you

These need your accounts, files or decisions, so they are not in the code.

1. **Search Console** (highest priority). Add a *Domain* property for
   `aderemisalako.me` at <https://search.google.com/search-console> and verify
   it with the DNS TXT record at your domain registrar (no file needed in the
   repo). Then submit `https://aderemisalako.me/sitemap.xml`. Use URL
   Inspection → Request indexing on `/`, `/services`, `/portfolio`,
   `/work/red-eye-effect/` and `/journal/node-workflow/`.
2. **Rich Results Test.** Run <https://search.google.com/test/rich-results> on
   `/`, `/work/red-eye-effect/` and `/journal/node-workflow/` after deploy. The
   schema parses locally, but this environment could not reach Google's tester.
3. **Analytics.** Pick one and send the snippet or ID:
   GA4 (a `G-XXXXXXX` measurement ID), or a privacy-friendly option with no
   cookie banner: Cloudflare Web Analytics (free), Plausible or GoatCounter.
4. **HTTPS.** In the repo on GitHub, go to Settings → Pages and confirm
   "Enforce HTTPS" is ticked. It could not be checked from here.
5. **Video hosting.** `assets/red-eye-effect.mp4` (5.2 MB) is self-hosted and
   also stands in as the preview clip for every concept tile. Upload finished
   films to YouTube or Vimeo and embed them. YouTube also gets you found in
   YouTube search, which matters for "YouTube video editor".
6. **Replace placeholders with real work.** The six concept projects and the
   eight photography images are placeholders. For each real project, give me
   the footage link, client or context, your role, tools and one outcome, and
   I'll create a `/work/<slug>/` page like Red Eye Effect.
7. **Profiles.** Add Behance, YouTube or Vimeo, and Instagram URLs if you have
   them. They go in the footer, the contact page and the schema `sameAs`.
8. **Google Business Profile.** Optional, but it's the strongest signal for
   "video editor Abuja". You can list it as a service-area business without a
   public street address.
9. **Private file.** `The 4th Era - YouTube Launch Strategy.docx` is publicly
   downloadable from your site. `robots.txt` stops indexing, not access. If it's
   private, delete it from the repo.
10. **Unused files.** `aderemi-cover.png` (1.6 MB), `salako-icon.png`,
    `salako-logo.png`, `rv-logo.png`, `assets/remi-visuals-og.png`,
    `assets/film-edge.svg` and `assets/fonts/HolidayFree.otf` aren't used by any
    page. They don't slow the site but can be removed.

## Limits of GitHub Pages worth knowing

- Cache headers are fixed at 10 minutes and can't be changed. Putting
  Cloudflare in front of the domain would allow long-lived caching.
- Folder pages always 301 to a trailing slash, which is why those URLs now end
  in `/`.
- The homepage intro animation covers the page for about 3 s on a first visit.
  It doesn't hurt LCP now that the hero renders underneath it, but visitors do
  wait. Consider showing it only on direct visits, or shortening it.
