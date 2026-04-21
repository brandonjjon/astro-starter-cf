# astro-starter-cf

Opinionated GitHub template for marketing sites on **Astro + Cloudflare Pages**. Click **Use this template** on GitHub, clone, configure, deploy.

## Quickstart

```bash
# After clicking "Use this template" on GitHub
gh repo clone your-org/your-new-site
cd your-new-site

# Tooling (optional — respects .mise.toml)
mise install

# Deps + git hooks
bun install
bunx lefthook install

# Local dev
bun run dev
```

Edit `src/consts.ts`, `wrangler.jsonc`, and `src/pages/index.astro` — you're off.

## Features

- **Astro 6** with `@astrojs/cloudflare` adapter (static + on-demand rendering)
- **Tailwind v4** (CSS-first `@theme` tokens)
- **Inter** via Astro Fonts API (self-hosted, preloaded)
- **MDX** + content collections ready (`src/content/posts/`)
- **astro-icon** drop SVGs into `src/icons/`
- **Sitemap** + **JSON-LD** (Organization + WebSite)
- **View Transitions** via `<ClientRouter />`
- **Contact form** — Astro Action → Cloudflare `send_email` binding
- **Cloudflare Turnstile** anti-spam (env-gated)
- **Google Analytics 4** with `astro:page-load` handling (env-gated)
- **Security headers** (`public/_headers`) — CSP, HSTS, Permissions-Policy
- **Strict TypeScript** + `astro check` in build
- **ESLint** (flat config) + **Prettier** (+ astro plugin)
- **Conventional Commits** via commitlint
- **Lefthook** — pre-commit (prettier/eslint/gitleaks), pre-push (check/test), commit-msg (commitlint)
- **Vitest** unit + **Playwright** E2E + **axe-core** a11y + **Lighthouse CI**
- **Renovate** with `minimumReleaseAge: 7 days`
- **GitHub Actions** — CI (lint/type/test/build) + Lighthouse on PRs
- **mise** pins Bun version

## Scripts

| Command             | What                                 |
| ------------------- | ------------------------------------ |
| `bun run dev`       | Astro dev server                     |
| `bun run cf:dev`    | `wrangler pages dev` (binding-aware) |
| `bun run build`     | `astro check` + build                |
| `bun run preview`   | Serve built site                     |
| `bun run check`     | Typecheck `.astro` + `.ts`           |
| `bun run lint`      | ESLint                               |
| `bun run format`    | Prettier write                       |
| `bun run test`      | Vitest                               |
| `bun run test:e2e`  | Playwright + axe                     |
| `bun run lhci`      | Lighthouse CI                        |
| `bun run cf:deploy` | `wrangler pages deploy dist`         |

## Configure for your project

1. **Branding** — edit `src/consts.ts` (`SITE_TITLE`, `SITE_URL`, etc.) and `src/pages/index.astro` copy
2. **Domain** — set `site:` in `astro.config.ts` to your real URL
3. **Cloudflare**
   - Push repo → Cloudflare Pages connect
   - Enable **Email Routing** on your domain; verify destination address
   - Set `destination_address` in `wrangler.jsonc` → your verified address
   - Set `name:` in `wrangler.jsonc` + `package.json` to match your Pages project
4. **Env vars** (Pages dashboard + local `.dev.vars`)
   - `PUBLIC_GA_MEASUREMENT_ID` — GA4 (optional)
   - `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` — anti-spam (optional)
   - `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
   - Secrets via `wrangler pages secret put TURNSTILE_SECRET_KEY`
5. **OG image** — drop `public/og.png` (1200×630)

## First-time setup checklist

```bash
cp .dev.vars.example .dev.vars   # fill values
bunx lefthook install            # git hooks (manual — ignore-scripts safe)
bunx playwright install chromium # for E2E
```

Optional:

- `brew install gitleaks` for secret-scan hook (silently skipped if missing)

## Project structure

```
src/
  actions/         # Astro Actions (server-only)
  components/      # BaseHead, Header, Footer, ContactForm, analytics
  content/posts/   # MDX/MD posts (content collection)
  icons/           # SVGs → <Icon name="…" />
  pages/           # Routes (index, contact, 404, robots.txt)
  styles/          # global.css (Tailwind v4 + @theme)
  consts.ts        # site-wide strings
public/
  _headers         # Cloudflare security headers
tests/e2e/         # Playwright + axe
test/              # Vitest
```

## Adding features later

- **React (or any framework)** — `bun astro add react`, then use islands with `client:*` directives
- **Sentry client errors** — `bun add @sentry/browser`, init in a `<script is:inline>` in `BaseHead.astro` gated by a DSN env var
- **Blog** — drop MD/MDX into `src/content/posts/`, create `src/pages/blog/[...slug].astro` using `getCollection('posts')`

## License

MIT. Replace with your own before publishing if needed.
