---
name: verify-site
description: Verify the portfolio site after any change (HTML, CSS, JS, blog content or build). Runs static checks (JS syntax, CSS braces, page wiring, broken links, blog build reproducibility) and an optional headless-browser smoke test. Use before telling the user a change is done, before committing, and before opening a pull request.
---

# Verify the site

This is a static site (GitHub Pages, no bundler). There is no test suite or linter, so `tools/verify.mjs` is the project's check.

## Run it

```
node tools/verify.mjs             # static checks, about a second
node tools/verify.mjs --browser   # plus a headless-Chromium smoke test of the main pages
```

The browser mode needs `playwright-core` or `playwright`. It is not a project dependency: install it somewhere outside the repo and set `PLAYWRIGHT_MODULE` to its `index.mjs` (for example `PLAYWRIGHT_MODULE=/path/to/node_modules/playwright-core/index.mjs`). In a cloud session also set `CHROMIUM_PATH` to the pre-installed browser (a `headless_shell` binary works best). It blocks all non-localhost requests (Google Fonts, analytics), so fonts fall back and that is expected.

## What it checks

- **Syntax:** every `.js` / `.mjs` parses (`node --check`); `styles.css`, `theme.css`, `addons/addons.css` have balanced braces.
- **Page wiring** (every public page): `theme.css` linked; add-ons css/js and a versioned `script.js?v=N` present; fonts link is Inter + Jost (no Fraunces); the retired page-transition curtain is not switched on.
- **References:** every local `href`/`src` resolves (extensionless URLs and `/index.html` directories count, as on GitHub Pages).
- **Blog build:** copies the repo to a temp folder, runs `node tools/build.mjs`, and fails if any tracked file would change. Posts, `blog/index.html`, `sitemap.*`, `feed.xml` and `llms.txt` are generated, so edit the source in `content/journal/` or `tools/templates/post.html` and rebuild; never hand-edit generated output without checking this passes.
- **Browser** (`--browser`): `/`, `/about`, `/services`, `/contact`, `/blog/`, `/portfolio`, `/films`, `/photography` load with no script errors, cursor dot and progress line present, no curtain element, no sideways scroll; `/portfolio` has two card decks; the gallery pages have tiles.

## Conventions worth knowing when a check fails

- Every public page loads, in order: `styles.css`, `theme.css`, `addons/addons.css?v=N`, `addons/addons.js?v=N` (with `data-ao="cursor,progress"`), `script.js?v=N`. Bump `?v=` on the changed asset across all pages (and in `tools/templates/post.html` plus the generated posts) so browsers drop cached copies.
- `index.html` is the only page using the full add-ons set (`window.AO = { reveal: false }`); other pages opt in with `data-ao`.
- Redirect stubs (`article.html`, `notices.html`, `journal/*`, `admin/`) are deliberately minimal and skipped by some checks.
- The opening animation plays once per browser session; tests set `sessionStorage['rv-intro']='1'` to skip it, and `?intro` on a URL replays it.
- `experiments/` holds parked work (noindex); it is only checked for broken links.

## After it passes

Say what was run and what passed or failed. Do not claim a change works in a real browser if only the static checks ran.
