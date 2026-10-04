# Silas Moracha · Portfolio

Personal portfolio of **Silas Moracha**: software engineer, cybersecurity enthusiast and AI training-data specialist.

**Live:** https://mcmnyages.github.io/silas_moracha.io/

Built with [Astro](https://astro.build), TypeScript and Tailwind CSS. Every page is pre-rendered to static HTML, so it loads fast and is fully readable by search engines and link-preview bots. JavaScript is used only for the extras: the terminal, the 3D objects, the theme toggle and animations.

## Features

- **Hero terminal** that types by itself on load and then takes commands (`help`, `projects`, `neofetch`, `hire`, …), over a full-width stream of terminal activity
- **Hand-rolled wireframe 3D** (`src/lib/wire3d.ts`, no dependencies): a globe with network links from Eldoret, plus a padlock, neural network, server stack, CPU, graduation cap and envelope, one per section
- **Live GitHub data** (latest repos, language breakdown, repo count) fetched at build time and refreshed weekly by CI
- Editorial layout on a 12-column grid, one accent colour (`--accent` in `src/styles/global.css`), dark/light theme
- Near full-bleed layout that uses wide screens; subtle 3D tilt on featured projects and the terminal; all motion respects `prefers-reduced-motion`
- SEO: canonical URLs, Open Graph/Twitter cards, JSON-LD `Person` schema, sitemap and robots.txt
- Optimised images (AVIF/WebP, responsive sizes) and self-hosted fonts

## Editing content

You rarely need to touch components. Content lives in plain TypeScript files:

| What | File |
| --- | --- |
| Name, role, email, socials, SEO text, contact form key | `src/config/site.ts` |
| Jobs and roles | `src/data/experience.ts` |
| Projects | `src/data/projects.ts` |
| Skills | `src/data/skills.ts` |
| CTFs, achievements, security focus | `src/data/security.ts` |
| Education, certifications, testimonial | `src/data/education.ts` |
| Photos | `src/assets/images/` |

After changing your photo, name or role, run `npm run images` to regenerate the social-preview image (`public/og.png`).

## Development

Requires Node.js 22.12+.

```sh
npm install
npm run dev       # http://localhost:4321/silas_moracha.io/
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

Set `GITHUB_TOKEN` locally if the GitHub API rate-limits you; without it, the GitHub sections are simply hidden.

## Project structure

```
src/
├── config/site.ts         # identity & SEO, the single source of truth
├── data/                  # content (experience, projects, skills, …)
├── components/
│   ├── sections/          # Hero, About, Experience, Projects, Security, Skills, Education, Contact
│   ├── Terminal.astro     # interactive terminal (logic in lib/terminal.ts)
│   ├── SEO.astro          # meta tags + structured data
│   └── …
├── layouts/BaseLayout.astro
├── lib/                   # github.ts (build-time API), terminal.ts, theme.ts, url.ts
├── pages/                 # index, 404, robots.txt
└── styles/global.css      # design tokens (dark/light) + Tailwind
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. It also rebuilds every Monday so GitHub stats stay current.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

To move to a custom domain, or to rename the repo to `mcmnyages.github.io`, update `SITE` and `BASE` in `astro.config.mjs`.
