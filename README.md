# Remi Visuals Portfolio

The official portfolio website of **Aderemi A. Salako**, the creative behind **Remi Visuals**.

Remi Visuals focuses on cinematic video editing, motion design, creative direction, and social media content. This website showcases selected projects, services, the creative process, and ways to work with me.

## Services

- Video editing
- Motion design
- Creative direction
- Social media campaigns
- Colour and sound finishing

## About Me

I’m Aderemi A. Salako, a visual storyteller working at the intersection of editing, motion, and creative technology. I create thoughtful, engaging work that feels cinematic while keeping the message clear.

## Contact

- Email: [hello@aderemisalako.me](mailto:hello@aderemisalako.me)
- LinkedIn: [Salako Abdullah](https://www.linkedin.com/in/abdullah-salako-b43461252/)
- X: [@remmivisuals](https://x.com/remmivisuals)
- YouTube: [@aderemi.salako](https://www.youtube.com/@aderemi.salako)
- Instagram: [@aderemi.salako](https://www.instagram.com/aderemi.salako/)
- Website: [abdullahsalako.github.io](https://abdullahsalako.github.io/)

## Built With

The website is built with HTML, CSS, and JavaScript and hosted with GitHub Pages.

## SEO

- `docs/SEO-AUDIT.md` lists what was fixed and what still needs doing (Search Console, analytics, video hosting).
- `docs/SEO-CHECKLIST.md` is the step-by-step for adding projects, blog posts and pages.

## Publishing

GitHub Pages publishes the `main` branch of `abdullahsalako/abdullahsalako.github.io` from the repository root.

Blog posts are written at [/admin](https://aderemisalako.me/admin/) (Sveltia CMS) and stored as Markdown in `content/journal/`. The **Build blog** GitHub Action (`.github/workflows/build-journal.yml`) turns them into static pages with `tools/build.mjs` on every save, and each morning pulls new posts from Substack with `tools/substack-sync.mjs`. To build locally: `npm ci --prefix tools && node tools/build.mjs`.

Each morning the **Analytics snapshot** Action (`.github/workflows/analytics-snapshot.yml`) copies GA4 and Search Console numbers into a private Google Sheet with `tools/analytics-snapshot.mjs`, for the daily report. It needs the `GOOGLE_SERVICE_ACCOUNT_JSON` and `ANALYTICS_SHEET_ID` secrets and the `GA4_PROPERTY_ID` variable, and prints no data to the (public) Action logs.

© 2026 Remi Visuals. All rights reserved.
