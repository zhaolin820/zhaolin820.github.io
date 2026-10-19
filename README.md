# Zhaolin Wang — Academic Homepage

Source repository for [zhaolin820.github.io](https://zhaolin820.github.io), built with [Eleventy (11ty) v3](https://www.11ty.dev/) and deployed automatically via GitHub Pages.

## Local Development

Requires **Node.js 22+** (Node.js 24 is used in CI).

```bash
npm install
npm run dev
```

Eleventy serves the site locally at `http://localhost:8080/` with live reload. Production build output is written to `_site/` (ignored by Git).

## Common Commands

```bash
npm run build          # Generate the production site into _site/
npm run normalize:data # Auto-populate publication IDs, ISO dates, and first-author flags
npm run test:data      # Validate JSON schemas, publication references, and URLs
npm run test:html      # Validate generated HTML markup
npm run test:links     # Check internal links and static asset references
npm run test:e2e       # Run Playwright responsive, theme, SEO, and accessibility tests
npm test               # Run the complete validation and test suite
```

Install Chromium once before running Playwright browser tests locally:

```bash
npx playwright install chromium
```

## Project Structure & Updating Content

All site content is data-driven and separated from page templates:

```text
├── assets/
│   ├── css/site.css                  # Monochrome academic theme, Pantone 485 hover, & dark mode
│   ├── images/                       # Portrait (me.jpg), HKU/ECE SVG logos, & research figures
│   ├── js/site.js                    # Theme toggle & scroll-reveal animations
│   └── pdfs/                         # Award certificates & documents
├── data/
│   ├── publications.json             # Canonical public publications catalog
│   └── publications.schema.json      # JSON Schema for publication entries
├── src/
│   ├── _data/
│   │   ├── site.json                 # Site metadata, email, navigation, & social/academic links
│   │   ├── news.json                 # Homepage news items (recent items + collapsible archive)
│   │   ├── cv.json                   # CV sections (Positions, Education, Awards, Talks, Service, Teaching)
│   │   ├── research.json             # Research overview directions & grouped paper IDs
│   │   ├── researchExtras.json       # Additional citations referenced only on the Research page
│   │   └── software.json             # Open-source software projects (OpenAirTwin)
│   ├── _includes/
│   │   ├── components/publication.njk # Shared publication item template
│   │   └── layouts/base.njk          # Global header (HKU + ECE logos, nav, theme toggle) & footer
│   ├── index.njk                     # Home / About & News page
│   ├── cv.njk                        # Curriculum Vitae page
│   ├── research.njk                  # Research overview page
│   ├── publications.njk              # Full publications list (grouped by category & authorship)
│   └── software.njk                  # Software page
└── scripts/                          # Data normalization, schema validation, & link checking scripts
```

### 1. Adding or Updating Publications (`data/publications.json`)

Publications are organized under `categories` (`Preprints`, `Journal Articles`, `Conference Papers`). Each item supports:

```json
{
  "id": "unique-paper-slug",
  "title": "Paper Title",
  "url": "https://ieeexplore.ieee.org/document/...",
  "authors": "<b>Z. Wang</b>, Coauthor Name, and Senior Author",
  "venue": "IEEE Journal on Selected Areas in Communications",
  "details": "vol. 44, pp. 1-15",
  "date": "2026",
  "date_iso": "2026-06",
  "is_first_author": true,
  "arxiv": "https://arxiv.org/pdf/2601.00000",
  "code": "https://github.com/...",
  "note": "ESI Highly Cited Paper",
  "award": "ESI Hot Paper"
}
```

- Always wrap `Z. Wang` in `<b>Z. Wang</b>` exactly once.
- Optional badges (`arxiv`, `code`, `note`, `award`) are rendered on a dedicated badge row below the venue line (`note` renders in bright blue; `award` renders in coral red).
- You can run `npm run normalize:data && npm run test:data` after adding new entries to auto-fill missing `id`, `date_iso`, or `is_first_author` fields and verify schema compliance.

### 2. Updating Homepage News (`src/_data/news.json`)

News items are sorted newest-first (`YYYY-MM`). Each item uses `segments` composed of plain text (`{ "text": "..." }`), links (`{ "label": "...", "url": "..." }`), or italicized titles (`{ "text": "...", "italic": true }`).
- News items from `2025` onward are displayed by default on the homepage; earlier items (`2020–2024`) are placed inside the collapsible archive (`src/index.njk`).

### 3. Updating CV (`src/_data/cv.json`)

Contains structured arrays for:
- `appointments`: Academic positions (`period`, `role`, `institution`, `institution_url`, `location`)
- `education`: Degrees (`period`, `degree`, `honor`, `institution`/`institutions`, `location`)
- `awards`: Honors & awards (`year`, `title`, optional `title_url`, `issuer`)
- `talks`: Talks & tutorials (`year`, `title`, `venue`)
- `service_groups`: Professional service grouped into `Editorial Positions`, `Conference Organizing Committees`, `Technical Program Committees`, and `Standardization`
- `teaching`: Courses (`year`, `course`, `institution`)

## Deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` runs `npm test` on pushes and pull requests, and automatically deploys `_site/` to GitHub Pages when changes are pushed to `main`.
