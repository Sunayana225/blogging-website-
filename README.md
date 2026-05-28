# Blogging Website

Monorepo for the Wildleaf Journal blogging site, API server, shared libraries, and build scripts.

## Overview

- `artifacts/nature-platform` is the public Vite site.
- `artifacts/api-server` is the Express API that serves articles, species, portfolio, and related content.
- `lib/*` contains shared API, DB, and schema packages.
- `scripts/*` contains repo-level maintenance, smoke test, and process utilities.

The site is prerendered during the build so deployed pages contain real HTML content for crawlers and readers.

## Prerequisites

- Node.js 24
- pnpm
- A valid `.env` in the repo root with `DATABASE_URL`

Do not commit secrets. Keep `.env` local or set the values in your hosting provider.

## Install

```bash
pnpm install
```

## Common Commands

```bash
pnpm run build
pnpm run typecheck
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/nature-platform run build
```

## Local Development

API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Site app:

```bash
pnpm --filter @workspace/nature-platform run dev
```

## Build Flow

The site package uses:

```json
"build": "vite build --config vite.config.ts && node scripts/prerender.js"
```

That means `pnpm run build` for the site will:

1. Build the Vite app.
2. Fetch public content from the API.
3. Write prerendered HTML into `dist/public`.

If the API is not same-origin in your deployment, set one of these environment variables for the prerender step:

- `PRERENDER_API_BASE_URL`
- `API_BASE_URL`
- `VITE_API_BASE_URL`

## Deployment Notes

- Vercel should use the package `build` script directly; no UI override is needed.
- Keep production secrets in Vercel environment variables.
- The prerender step is meant to make the content easier to extract from the deployed site without relying on client-side rendering.

## Repo Layout

- `artifacts/api-server` - API service
- `artifacts/nature-platform` - public site
- `artifacts/mockup-sandbox` - design sandbox
- `lib/api-client-react` - generated React API client
- `lib/api-spec` - OpenAPI source and generation config
- `lib/api-zod` - generated Zod schemas
- `lib/db` - shared database schema and access helpers
- `scripts` - repo automation and smoke tests

## Notes

- `cookies.txt`, `DATABASE_URL`, and other secrets must stay out of git.
- The repository already includes a focused prerender commit for the public site build.
