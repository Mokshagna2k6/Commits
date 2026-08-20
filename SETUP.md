# StackFox — Setup & Deployment Guide

## Architecture Overview

```
stack-fox/
├── apps/
│   ├── api/          # Fastify 4 REST API (port 4000)
│   └── web/          # Next.js 14 marketing site (port 3000)
├── client/           # Vite + React dashboard (port 5173, standalone)
├── packages/
│   ├── prisma/       # Shared Prisma schema & client
│   └── ui/           # Shared UI component library
├── shared/
│   └── stackfox-data.json   # 242 services, 13 categories
├── turbo.json
└── pnpm-workspace.yaml
```

- **Turborepo** orchestrates `apps/*` and `packages/*`.
- The `client/` directory is a standalone Vite app (not part of the Turborepo workspace). It proxies `/api/*` requests to the API server during development.

---

## Prerequisites

| Tool       | Version   | Notes                                    |
|------------|-----------|------------------------------------------|
| Node.js    | >= 20     | Required by `engines` in root package.json |
| pnpm       | 9.6.0     | `corepack enable && corepack prepare pnpm@9.6.0 --activate` |
| PostgreSQL | 15+       | Via Supabase (hosted) or local instance   |
| Redis      | 6+        | Via Upstash (hosted) or local instance    |

---

## 1. Local Development

### 1.1 Clone & Install

```bash
git clone <repo-url> stack-fox
cd stack-fox

# Install monorepo dependencies (apps + packages)
pnpm install

# Install client dependencies (standalone)
cd client && pnpm install && cd ..
```

### 1.2 Environment Variables

Create a `.env` file in the project root. All apps read from here via `dotenv`.

```env
# ── Database (Supabase PostgreSQL) ─────────────────────
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
DIRECT_DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# ── Supabase ───────────────────────────────────────────
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...

# ── Redis (Upstash or local) ──────────────────────────
UPSTASH_REDIS_REST_URL=https://<your-upstash>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
REDIS_URL=redis://default:<password>@<host>:6379

# ── Auth ──────────────────────────────────────────────
JWT_SECRET=<random-string-32-chars>
AUTH_SECRET=<random-string-32-chars>

# ── AI ────────────────────────────────────────────────
GEMINI_API_KEY=<google-ai-key>

# ── Payments (optional) ──────────────────────────────
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=<secret>
STRIPE_SECRET_KEY=sk_...

# ── Server ────────────────────────────────────────────
PORT=4000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

> **Important**: `DATABASE_URL` uses port **6543** (Supabase connection pooler, for runtime).
> `DIRECT_DATABASE_URL` uses port **5432** (direct connection, for migrations/introspection).

### 1.3 Database Setup

```bash
# Generate Prisma client
cd packages/prisma
npx prisma generate

# Push schema to database (creates/updates tables)
npx prisma db push

# (Optional) Seed initial data
cd ../..
pnpm db:seed
```

### 1.4 Start Development Servers

**Option A — Turborepo (API + Web)**

From the project root:

```bash
pnpm dev
```

This starts:
- **API** at `http://localhost:4000` (Fastify via `tsx watch`)
- **Web** at `http://localhost:3000` (Next.js dev server)

**Option B — Client dashboard (standalone)**

In a separate terminal:

```bash
cd client
pnpm dev
```

This starts the Vite dev server at `http://localhost:5173`.

The client proxies API calls automatically:
- `/api/*` → `http://localhost:4000` (strips `/api` prefix)
- `/uploads/*` → `http://localhost:4000`
- `/socket.io/*` → `http://localhost:4000` (WebSocket)

### 1.5 Verify Everything Works

1. Open `http://localhost:5173` — you should see the StackFox dashboard
2. Open `http://localhost:3000` — you should see the Next.js marketing site
3. Test the API health check:
   ```bash
   curl http://localhost:4000/health/ping
   ```

---

## 2. Available Scripts

### Root (Turborepo)

| Script            | Command                | Description                         |
|-------------------|------------------------|-------------------------------------|
| `pnpm dev`        | `turbo dev`            | Start all dev servers               |
| `pnpm build`      | `turbo build`          | Build all apps                      |
| `pnpm lint`       | `turbo lint`           | Lint all packages                   |
| `pnpm typecheck`  | `turbo typecheck`      | TypeScript check all packages       |
| `pnpm db:generate`| `turbo db:generate`    | Generate Prisma client              |
| `pnpm db:push`    | `turbo db:push`        | Push schema to database             |
| `pnpm db:migrate` | `turbo db:migrate`     | Run Prisma migrations               |
| `pnpm db:seed`    | `turbo db:seed`        | Seed the database                   |
| `pnpm clean`      | `turbo clean`          | Remove build artifacts              |

### Client (standalone)

| Script           | Command       | Description                   |
|------------------|---------------|-------------------------------|
| `pnpm dev`       | `vite`        | Dev server on port 5173       |
| `pnpm build`     | `vite build`  | Production build to `dist/`   |
| `pnpm preview`   | `vite preview` | Preview production build      |

---

## 3. Production Deployment

### 3.1 Build for Production

```bash
# Build monorepo apps
pnpm build

# Build client separately
cd client && pnpm build && cd ..
```

Build outputs:
- `apps/api/dist/` — compiled API server
- `apps/web/.next/` — Next.js production build
- `client/dist/` — static Vite build (serve with nginx or any static host)

### 3.2 Run Production Servers

**API server**:
```bash
cd apps/api
node dist/server.js
```
The API listens on the `PORT` env var (default 4000). In production, set `PORT=5000` or whichever port you prefer.

**Web (Next.js)**:
```bash
cd apps/web
pnpm start
```
Starts on port 3000 by default.

**Client (static files)**: Serve `client/dist/` with nginx, Caddy, or any static file server. Requires a reverse proxy to route `/api/*` to the API server.

### 3.3 Docker Deployment

The repo includes Dockerfiles, but they reference an older project structure. Here's how to use them with notes on what needs updating:

**`Dockerfile.client`** (works as-is):
- Multi-stage build: Node 20 Alpine → nginx Alpine
- Copies `shared/stackfox-data.json` into the build context
- Serves the Vite build on port 80
- Uses `nginx.conf` for routing (API proxy, SPA fallback, gzip, security headers)

```bash
docker build -f Dockerfile.client -t stackfox-client .
docker run -p 80:80 stackfox-client
```

**`Dockerfile.server`** (needs updating):
- Currently references `server/` directory — should be `apps/api/`
- Currently exposes port 5000 — adjust to match your `PORT` env var
- Update the `CMD` to `node dist/server.js`

**`docker-compose.yml`** (needs updating):
- References the old `server/` and `client/` structure
- Contains MongoDB env vars (legacy) — replace with PostgreSQL/Supabase env vars
- Services to configure:
  - `server`: build from `Dockerfile.server`, pass all `.env` vars
  - `client`: build from `Dockerfile.client`, expose port 80
  - Remove or update the `seed` service

**nginx.conf** (works as-is for Docker):
- Proxies `/api/*` to `http://server:5000`
- Proxies `/socket.io/*` for WebSocket
- Proxies `/uploads/*` for file serving
- SPA fallback for client-side routing
- Gzip compression and security headers

### 3.4 Cloud Deployment Options

**Vercel** (recommended for Web + Client):
- Deploy `apps/web/` as a Next.js project
- Deploy `client/` as a Vite/static project
- Set environment variables in Vercel dashboard

**Railway / Render** (recommended for API):
- Deploy `apps/api/` as a Node.js service
- Set build command: `cd apps/api && pnpm build`
- Set start command: `node apps/api/dist/server.js`
- Add all environment variables

**Supabase** (database — already configured):
- Ensure the Supabase project is active (not paused)
- Use the pooler URL (port 6543) for `DATABASE_URL`
- Use the direct URL (port 5432) for `DIRECT_DATABASE_URL`

### 3.5 Production Environment Variables

Same as local (section 1.2), with these changes:

```env
PORT=5000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
NODE_ENV=production
```

### 3.6 Production Checklist

- [ ] Supabase project is active (not paused)
- [ ] `prisma db push` or `prisma migrate deploy` has been run
- [ ] All environment variables are set
- [ ] `CORS_ORIGIN` points to your production frontend URL
- [ ] `LOG_LEVEL` is set to `info` or `warn` (not `debug`)
- [ ] Razorpay/Stripe webhook URLs are configured in their dashboards
- [ ] Redis is reachable from the production server
- [ ] SSL/TLS is configured (via reverse proxy or cloud provider)

---

## 4. Database Management

### Prisma Commands (run from `packages/prisma/`)

```bash
# Generate the Prisma client after schema changes
npx prisma generate

# Push schema changes directly (no migration history — good for prototyping)
npx prisma db push

# Create a migration file (for production migration workflow)
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset the database (destructive — drops all data)
npx prisma migrate reset
```

### Common Fix: Prisma Generate Fails with EPERM

If `prisma generate` fails with an EPERM error on `query_engine-windows.dll.node`, a running API server is locking the file. Stop the API process first:

```powershell
# Find and stop the node process holding the lock
Get-Process node | Stop-Process -Force

# Then regenerate
cd packages/prisma
npx prisma generate
```

---

## 5. Troubleshooting

| Problem | Fix |
|---------|-----|
| `EADDRINUSE` on port 3000/4000/5173 | Kill the process using the port: `npx kill-port 3000` |
| Prisma generate EPERM | Stop the running API server, then regenerate (see section 4) |
| Supabase connection refused | Check if your Supabase project is paused — restore it from the dashboard |
| `FST_ERR_DUPLICATED_ROUTE` | A Fastify route is registered twice — check for duplicate endpoint definitions |
| Next.js config error | Ensure config is `next.config.mjs` (not `.ts`) for Next.js 14 |
| Redis connection errors on startup | Redis is optional for local dev — the API uses `lazyConnect: true` and will work without it for most features |
| Client API calls return 404 | Make sure the API server is running on port 4000 — Vite proxies `/api/*` there |

---

## 6. Project Ports Summary

| Service       | Port  | URL                        |
|---------------|-------|----------------------------|
| Fastify API   | 4000  | http://localhost:4000      |
| Next.js Web   | 3000  | http://localhost:3000      |
| Vite Client   | 5173  | http://localhost:5173      |
| Vite Preview  | 4173  | http://localhost:4173      |
| Prisma Studio | 5555  | http://localhost:5555      |
