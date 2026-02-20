# Lumen

Lumen: A glimmer on edge nodes. An blog architecture, powered by Cloudflare, Hono and Vue.

## 部署

### 数据库与文件存储

Lumen 使用 Cloudflare D1 SQL 数据库和 R2 对象存储保存数据和文件。

创建并初始化 D1 SQL 数据库：

```bash
wrangler d1 create lumen-metadata
wrangler d1 execute lumen-metadata --remote --file infra/d1/0001_init.sql
```

创建 R2 对象存储桶：

```bash
wrangler r2 bucket create lumen-content
```

### API

Lumen 使用 Cloudflare Workers 作为 API。

使用下列命令获取到 D1 SQL 数据库的 ID：

```bash
wrangler d1 list
```

将数据库 ID 写入 `wrangler.toml` 并部署：

```bash
export LUMEN_METADATA_DATABASE_ID="<LUMEN_METADATA_DATABASE_ID>"

cd apps/api

cp wrangler.toml.example wrangler.toml
sed -i "s/^database_id = \".*\"/database_id = \"$LUMEN_METADATA_DATABASE_ID\"/" wrangler.toml

wrangler deploy
```

## Tech Stack

- Frontend: Vue 3 + Vite + Tailwind CSS v4
- API: Hono on Cloudflare Workers
- Data: Cloudflare D1 + R2
- Workspace: pnpm monorepo

## Prerequisites

- Node.js >= 24.13.1
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
- `pnpm dev:api`: run only api (remote mode)
- `pnpm contract:validate`: validate OpenAPI contract
- `pnpm lint`: lint workspace via OXC (`oxlint`)
- `pnpm format`: format workspace via OXC (`oxfmt`)
- `pnpm typecheck`: run TypeScript checks
- `pnpm build`: build all apps
- `pnpm check`: release gate (contract + lint + format + typecheck + build)

## Project Layout

- `apps/web`: Vue frontend
- `apps/api`: Hono API worker (default `wrangler dev --remote`)
- `infra/d1`: D1 initialization files and config
- `infra/r2/wrangler.toml`: R2 infrastructure config
- `packages/api-contract`: OpenAPI contract source
- `packages/shared`: shared constants/types