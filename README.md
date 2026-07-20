# Zhaolin Wang — Academic Homepage

Source for [zhaolin820.github.io](https://zhaolin820.github.io), built with Eleventy and deployed to GitHub Pages.

## Local development

Requires Node.js 22 or newer (Node.js 24 is used in CI).

```bash
npm install
npm run dev
```

Eleventy serves the site locally and rebuilds when a source file changes. Production output is written to `_site/` and is not committed.

## Common commands

```bash
npm run build          # Generate the production site
npm run test:data      # Validate publication and content data
npm run test:html      # Validate generated HTML
npm run test:links     # Check generated internal links and assets
npm run test:e2e       # Run responsive, theme, SEO, and accessibility tests
npm test               # Run the complete test suite
```

Install Chromium once before running browser tests locally:

```bash
npx playwright install chromium
```

## Updating content

- General site settings, navigation, profiles, news, and research directions live in `src/_data/`.
- Page templates live in `src/` and shared layouts/components live in `src/_includes/`.
- Public publication records live in `data/publications.json` and remain available at `/data/publications.json` after deployment.
- Images and certificates live in `assets/`.

Each publication requires a unique `id`, an ISO `date_iso` value, and an explicit `is_first_author` value. After adding legacy-style records, run:

```bash
npm run normalize:data
npm run test:data
```

Research groups reference publication IDs instead of repeating citation metadata. Research-only references that are intentionally absent from the public publication list live in `src/_data/researchExtras.json`.

## Deployment

The workflow in `.github/workflows/pages.yml` validates pull requests and deploys `_site/` after successful pushes to `main`.

For the first deployment after this migration, open the repository's **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. No generated files or `gh-pages` branch are required.
