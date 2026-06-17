# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a personal documentation/blog site built with [VuePress 2](https://v2.vuepress.vuejs.org/) (RC) and the [vuepress-theme-hope](https://theme-hope.vuejs.press/) theme. Content is written in Markdown under `docs/` and deployed to GitHub Pages from `docs/.vuepress/dist`.

## Common commands

All commands use `pnpm`.

- Start the dev server on port 3000: `pnpm docs:dev` (or run `RunDev.bat` on Windows)
- Start dev with a clean cache: `pnpm docs:clean-dev`
- Build the static site: `pnpm docs:build`
- Update VuePress/theme packages: `pnpm docs:update-package`
- Install dependencies: `pnpm install`

The build output goes to `docs/.vuepress/dist` and is excluded from Git by `.gitignore`.

## Architecture

### VuePress configuration

- `docs/.vuepress/config.js` — top-level VuePress config (`defineUserConfig`), language, title, description, bundler (`@vuepress/bundler-vite`), and theme entry point.
- `docs/.vuepress/theme.ts` — `hopeTheme` configuration. This is where the navbar, sidebar, darkmode, blog settings, plugins, and Markdown enhancements are wired up.
- `docs/.vuepress/navbar.ts` — navbar definition imported by `theme.ts`.
- `docs/.vuepress/sidebar.ts` — sidebar definition imported by `theme.ts`. Uses `"structure"` for auto-generated sections (`/Vue/`, `/Bookmarks/`, `/Language/`, blog plugin pages) and explicit arrays for `/Unity/` and `/Nodejs/`.
- `docs/.vuepress/styles/index.scss` — global style overrides.

### Content structure

- `docs/README.md` — site homepage. Uses the `Blog` layout with hero image (`/assets/main_bg.jpg`), hero text, tagline, and project cards.
- `docs/Unity/` — Unity-related notes, manual summaries, roadmaps, optimization, interview questions, and book notes.
- `docs/Bookmarks/` — curated bookmarks grouped by topic (GameDevelopment, AI, Language, Miscellaneous, Programming).
- `docs/Language/` — programming language notes (C#, Go, etc.).
- `docs/Nodejs/` — Node.js tooling notes (npm, pnpm).
- `docs/Vue/` — VuePress setup/deployment notes.

### Theme features in use

- **Blog mode**: enabled in `theme.ts` with avatar, name, and description. The homepage layout is `Blog`.
- **Search**: `@vuepress/plugin-slimsearch` is enabled.
- **Icons**: FontAwesome icons via the `icon` plugin; referenced in navbar/sidebar/page frontmatter by name (e.g., `icon: house`).
- **Components**: `VPCard` is registered globally.
- **Markdown extensions**: `codeTabs`, `tabs`, `align`, `attrs`, `sup`, `sub`.

## Deployment

`.github/workflows/deploy-docs.yml` builds and deploys to the `gh-pages` branch on every push to `main`. It uses `pnpm install --frozen-lockfile`, runs `pnpm run docs:build`, writes `docs/.vuepress/dist/.nojekyll`, and publishes the `docs/.vuepress/dist` folder.

## Notes for editing

- The site language is `zh-CN` and content is primarily in Chinese.
- Sidebar paths use URL-style prefixes (e.g., `/Unity/`) and map to Markdown files/folders under `docs/`.
- Navbar children use `prefix` + `link` to build nested routes; `link: "README.md"` inside a `prefix: "Unity/"` item resolves to `/Unity/README.html`.
- Theme options such as `contributors`, `editLink`, and `changelog` are disabled in `theme.ts`.
