# Lumen

Lumen: A glimmer on edge nodes. An blog architecture, powered by Cloudflare, Hono and Vue.

## Tech Stack

- Frontend: Vue 3 + Vite + Tailwind CSS v4
- API: Hono on Cloudflare Workers
- Data: Cloudflare D1 + R2
- Workspace: pnpm monorepo

## Prerequisites

- Node.js >= 22.12.0
- pnpm >= 10

## Quick Start

```bash
pnpm install
pnpm dev
```

- Web dev server: http://localhost:5173
- API dev server: http://localhost:8787

## Scripts

- `pnpm dev`: run all apps in parallel
- `pnpm dev:web`: run only frontend
- `pnpm dev:api`: run only api
- `pnpm contract:validate`: validate OpenAPI contract
- `pnpm lint`: lint workspace via OXC (`oxlint`)
- `pnpm format`: format workspace via OXC (`oxfmt`)
- `pnpm typecheck`: run TypeScript checks
- `pnpm build`: build all apps
- `pnpm check`: release gate (contract + lint + format + typecheck + build)

## Project Layout

- `apps/web`: Vue frontend
- `apps/api`: Hono API worker
- `packages/api-contract`: OpenAPI contract source
- `packages/shared`: shared constants/types