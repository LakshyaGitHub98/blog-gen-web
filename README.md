# blog-gen-web — Standalone Frontend

Next.js 16 + shadcn UI for the blog-gen humanizer pipeline. 100% self-contained — backend URL env se switch hota hai, code change nahi.

## Quick Start (bun)

```bash
bun install
cp .env.example .env.local   # edit if needed
bun run dev                  # http://localhost:3000
```

> Requires `bun >=1.4.0` (`packageManager: bun@1.4.0`)

## Env Vars (1 jagah se backend badlo)

| Var | Kahan | Example |
|-----|-------|---------|
| `NEXT_PUBLIC_API_URL` | browser + server | `http://127.0.0.1:8000` |
| `API_BASE_URL` | server rewrites (`/api/*` proxy) | same as above |
| `NEXT_PUBLIC_MOCK` | no-backend demo | `true` |

`src/lib/config.ts` → `apiUrl(path)` + `next.config.ts` rewrites use these. Hardcoded `127.0.0.1:8000` only fallback hai.

```bash
# local backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
API_BASE_URL=http://127.0.0.1:8000
bun run dev

# no backend demo (mock data)
NEXT_PUBLIC_MOCK=true bun run dev

# production (Vercel Dashboard → Env Vars)
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
API_BASE_URL=https://your-api.onrender.com
```

## Scripts

```bash
bun run dev       # dev server (Turbopack)
bun run build     # production build — 3 routes: /, /post/[id], /_not-found
bun run lint      # eslint (next/core-web-vitals)
bunx tsc --noEmit # typecheck
bunx shadcn@latest add <component>
```

## Standalone / Alag Repo

Ye folder khud git root hai (`git filter-repo --subdirectory-filter web` done). Alag repo banane ke liye bas copy → `git init` → push. `src/**/*` me `@/` ke bahar koi import nahi, `node_modules/next` ke bahar ka code nahi.

## Stack

Next 16.3, React 19, Tailwind 4, shadcn (radix-nova), lucide-react, react-markdown — managed with **bun** (`bun.lock`)
