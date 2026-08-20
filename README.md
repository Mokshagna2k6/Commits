# StackFox — Full-Stack IT Consultancy Platform

> **Smart Code, Swift Delivery.**

StackFox is a production-grade IT consultancy platform that lets Indian businesses browse, configure, and purchase technology services through an Amazon-style cart experience. Every service is broken into individually priced atomic pieces — clients add to cart, configure, and checkout.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 · Vite 5 · TailwindCSS 3 · Zustand · React Router 6 |
| Backend | Node.js 20 · Express 4 · Mongoose 8 · Socket.io 4 |
| Database | MongoDB 7 (Atlas or local) |
| Payments | Razorpay |
| Auth | JWT (access + refresh tokens) · bcrypt · OTP via email |
| Email | Nodemailer (SendGrid / SMTP) |
| File storage | Local (dev) · S3-compatible (prod) |
| PDF | PDFKit |
| Realtime | Socket.io |
| Deployment | Stack-agnostic — Docker, Vercel, Railway, VPS, AWS all supported |

---

## Repo structure

```
stackfox/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets (logo, favicon, og-image)
│   ├── src/
│   │   ├── data/
│   │   │   └── stackfox-data.json   # Single source of truth for all services/packages/copy
│   │   ├── lib/                # API client, auth helpers, utilities, custom hooks
│   │   ├── components/         # Shared UI primitives + layout (Navbar, Footer, etc.)
│   │   ├── pages/              # Public-facing pages (Home, Builder, Catalog, etc.)
│   │   ├── app/                # Authenticated app shell
│   │   │   ├── client/         # Client dashboard pages
│   │   │   ├── team/           # Team dashboard pages
│   │   │   └── admin/          # Admin dashboard pages
│   │   ├── store/              # Zustand stores (auth, cart, UI)
│   │   ├── routes.jsx          # React Router config
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express + Mongoose backend
│   ├── src/
│   │   ├── config/             # Environment, DB connection, logger
│   │   ├── models/             # Mongoose schemas (16 models)
│   │   ├── controllers/        # Route handlers / business logic
│   │   ├── routes/             # Express routers
│   │   ├── middleware/         # Auth, RBAC, validation, error handler
│   │   ├── services/           # Razorpay, mailer, PDF, GST, Socket.io
│   │   ├── utils/              # ApiError, ApiResponse, helpers
│   │   ├── seed/               # Database seed scripts
│   │   ├── app.js              # Express app setup (middleware, routes, error handler)
│   │   └── server.js           # HTTP server + DB connect + Socket.io bootstrap
│   ├── uploads/                # Local file uploads (gitignored)
│   ├── .env.example
│   └── package.json
│
├── shared/
│   └── stackfox-data.json      # Canonical copy — build scripts copy to client/src/data/
│
├── docker-compose.yml          # MongoDB + server + client
├── Dockerfile.client
├── Dockerfile.server
├── .gitignore
└── README.md                   # You are here
```

---

## Quick start (local development)

### Prerequisites

- **Node.js** >= 20 LTS
- **MongoDB** >= 7 (local install or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- **npm** >= 10

### 1. Clone and install

```bash
git clone https://github.com/artwallabs/stackfox.git
cd stackfox

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in:

```env
# ── Core ──────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ── Database ──────────────────────────
MONGODB_URI=mongodb://localhost:27017/stackfox

# ── Auth ──────────────────────────────
JWT_SECRET=your-super-secret-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Email (SMTP) ─────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=StackFox <noreply@stackfox.in>

# ── Razorpay ─────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# ── File uploads ─────────────────────
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ── S3 (production, optional) ────────
# S3_BUCKET=
# S3_REGION=
# S3_ACCESS_KEY=
# S3_SECRET_KEY=
# S3_ENDPOINT=

# ── Admin seed ───────────────────────
ADMIN_EMAIL=admin@stackfox.in
ADMIN_PASSWORD=StackFox@Admin2024
```

### 3. Seed the database

```bash
cd server

# Creates the admin user
npm run seed:admin

# Loads all services, categories, packages, and bundles from stackfox-data.json
npm run seed:catalog

cd ..
```

### 4. Start development servers

You need two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
# API docs: http://localhost:5000/api/health
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## NPM scripts

### Server (`/server`)

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `nodemon src/server.js` | Start with hot reload |
| `start` | `node src/server.js` | Production start |
| `seed:admin` | `node src/seed/seedAdmin.js` | Create admin user |
| `seed:catalog` | `node src/seed/seedCatalog.js` | Load services/packages/bundles from JSON |
| `seed:all` | `npm run seed:admin && npm run seed:catalog` | Full seed |
| `lint` | `eslint src/` | Lint server code |

### Client (`/client`)

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `vite build` | Production build to `/dist` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint src/` | Lint client code |

---

## Deployment

StackFox is stack-agnostic. Pick your target:

### Option A — Docker Compose (any VPS)

```bash
docker-compose up -d
# Starts MongoDB + server + client (Nginx)
# App available on port 80
```

### Option B — Vercel (frontend) + Railway (backend + MongoDB)

1. Push repo to GitHub
2. Import `client/` folder in Vercel — it auto-detects Vite
3. Create a Railway project, add MongoDB plugin + deploy `server/`
4. Set env vars in both platforms
5. Update `CLIENT_URL` and `VITE_API_URL` accordingly

### Option C — Single VPS (PM2 + Nginx)

```bash
# Build frontend
cd client && npm run build && cd ..

# Start backend with PM2
cd server && pm2 start src/server.js --name stackfox-api

# Configure Nginx to serve client/dist as static + proxy /api to port 5000
```

### Option D — AWS (EC2 + DocumentDB/Atlas + S3)

Same as VPS but with managed services. Enable S3 env vars for file uploads.

---

## Architecture decisions

### Single source of truth — `stackfox-data.json`

All 180+ services, 13 categories, theme packages, industry bundles, and layman explanations live in one JSON file. This file is:
- Loaded by the seed script into MongoDB for API queries
- Imported directly by the React frontend for instant rendering (no API call needed for catalog browsing)
- The canonical copy lives at `shared/stackfox-data.json`

**Why?** It means you can update pricing, add services, or change copy in ONE place and both frontend and backend reflect it.

### Auth model

- **Roles:** `client`, `team`, `admin`, `freelancer`
- JWT access tokens (15min) + refresh tokens (7 days, httpOnly cookie)
- Admin is gated by `admin@stackfox.in` email (matches existing artifact pattern)
- RBAC middleware checks role on every protected route

### GST handling

- All prices are stored **exclusive of GST**
- GST (18% for IT services) is calculated at cart/checkout/invoice time
- `services/gst.service.js` handles CGST + SGST (intra-state) vs IGST (inter-state)
- Invoices show GST breakdown per Indian compliance requirements

### Razorpay integration

- Server creates a Razorpay order → client opens Razorpay checkout modal → webhook confirms payment → invoice marked paid
- Supports partial payments (milestone-based billing)

---

## Brand tokens

| Token | Value |
|-------|-------|
| Primary orange | `#FF4D00` |
| Background warm white | `#FAFAF8` |
| Body font | Outfit (Google Fonts) |
| Data/mono font | JetBrains Mono (Google Fonts) |
| Logo | Flat geometric polygon fox head, negative-space cutouts |
| Tagline | Smart Code, Swift Delivery. |
| Keywords | BUILD · SHIP · SCALE |

---

## API overview

Base URL: `http://localhost:5000/api`

| Group | Prefix | Auth |
|-------|--------|------|
| Health | `/health` | Public |
| Auth | `/auth` | Public |
| Catalog | `/catalog` | Public (read), Admin (write) |
| Cart | `/cart` | Client |
| Quotes | `/quotes` | Client + Admin |
| Projects | `/projects` | Client + Team + Admin |
| Invoices | `/invoices` | Client + Admin |
| Payments | `/payments` | Client |
| Files | `/files` | Authenticated |
| Messages | `/messages` | Authenticated |
| Users | `/users` | Admin |
| Jobs | `/jobs` | Public (read), Admin (write) |
| Applications | `/jobs/:id/apply` | Public |
| Tasks | `/tasks` | Team + Admin |
| Blog | `/blog` | Public (read), Admin (write) |
| Support | `/support` | Client + Admin |
| Notifications | `/notifications` | Authenticated |
| Analytics | `/analytics` | Admin |

Full endpoint documentation will be generated as a Postman collection at Checkpoint 1 (after file 74).

---

## Contributing

This project is built by Artwall Labs. Internal contributors follow the file-by-file build protocol documented in the StackFox Master Plan.

---

## License

Proprietary — Artwall Labs. All rights reserved.
