# JOYCO Registry Architecture

## Overview

The project is a Next.js App Router site that serves Fumadocs-based documentation, a shadcn-compatible component registry, and demo views for registry blocks. Content is MDX-first and rendered through Fumadocs layouts and page components.

## Data Management

- **MDX content** lives in `content/` and is typed/validated by `source.config.ts` using Fumadocs schemas.
- **Fumadocs source** is built in `lib/source.ts` and provides a shared page tree and metadata for docs, search, OG images, and LLM exports.
- **Registry definitions** live in `registry.json` and component source files under `registry/joyco/blocks/`.
- **Registry artifacts** are served from `public/r/` (JSON registry output consumed by shadcn tooling).
- **External registry mapping** is read from MDX frontmatter via `lib/external-registries.ts` and used to generate Next.js redirects.
- **Client-side config state** uses Jotai with `atomWithStorage` in `hooks/use-config.ts` to persist UI preferences in localStorage.
- **Demo inventory** is discovered from `demos/` by `lib/registry-examples.ts` and exposed to demo routes.

## Data Fetching Patterns

- **Static generation** is the default: docs pages, LLM markdown routes, OG images, and demo pages all use `generateStaticParams` and set `revalidate = false` where applicable.
- **Server-side fetches** call external services:
  - `lib/stats.ts` fetches weekly download stats from `https://workers.joyco.studio`.
  - `lib/track.ts` posts download events (requires `JOYCO_WORKER_SECRET`).
- **Search** is served via `app/api/search/route.ts` using `fumadocs-core` server search helpers.
- **LLM exports** are served from `app/llm/[[...slug]]/route.ts` and mapped from `.md` URLs via Next.js rewrites in `next.config.ts`.

## Layout and Rendering Patterns

- **Root layout** (`app/layout.tsx`) applies global CSS, fonts, and wraps pages in `RootProvider`.
- **Docs layout** (`app/(registry)/layout.tsx`) uses `DocsLayout` with `source.pageTree` and shared nav options from `lib/layout.shared.tsx`.
- **Docs rendering** (`app/(registry)/[[...slug]]/page.tsx`) composes `DocsPage`, TOC, and MDX rendering via `mdx-components.tsx`.
- **Demo rendering** (`app/(view)/view/[name]/page.tsx`) resolves demo components from `demos/` and renders them with `Suspense`.
- **OG images** are generated in `app/og/docs/[...slug]/route.tsx` using `next/og` and Fumadocs’ default image generator.

## Key Paths

- `app/` — App Router routes, layouts, API endpoints, LLM and OG image routes.
- `content/` — MDX documentation source.
- `registry/` — Registry component source files.
- `public/r/` — Published registry JSON assets.
- `lib/` — Fumadocs source loader, registry helpers, and fetch utilities.
- `hooks/` — Client-side state hooks (Jotai-based config).
