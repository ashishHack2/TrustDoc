# 🚀 TRUSTDOC Production & Cloud Deployment Guide

This guide provides complete instructions and configuration settings for deploying **TRUSTDOC** across cloud environments (Vercel, Render, Docker, Railway, AWS, and Linux VPS).

---

## 🏛️ Architecture & Port Mapping

| Component | Technology | Default Port | Production Role |
|---|---|---|---|
| **Frontend** | Next.js 14 + React 18 + TailwindCSS | `3000` | Officer UI, Live Cam Scanner, Tactical HUD |
| **Backend API** | FastAPI + Python 3.11 + Uvicorn | `8000` | 9-Layer Verification Engine, OpenCV Forensics |
| **Database** | PostgreSQL 15 / SQLite | `5432` / local | Asynchronous Case & User Persistence |
| **Cache & Queue** | Redis 7 + Celery | `6379` | Background forensic batch worker queue |
| **Object Store** | MinIO (S3 Compatible) | `9000` / `9001` | Evidence document & forensic heatmap storage |

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Recommended | `postgresql://trustdoc:trustdoc@localhost:5432/trustdoc` (or `sqlite:///./trustdoc.db`) | Database connection string |
| `CORS_ORIGINS` | Recommended | `http://localhost:3000,https://your-frontend.vercel.app` (or `*`) | Allowed frontend origins |
| `JWT_SECRET` | **Required in Prod** | `<generate-32-char-random-secret>` | Secret key for JWT auth token signing |
| `JWT_REFRESH_SECRET` | **Required in Prod** | `<generate-32-char-random-secret>` | Secret key for JWT refresh tokens |
| `DEMO_MODE` | Optional | `true` | Allows pre-loaded demo credentials & sample cases |
| `MINIO_ENDPOINT` | Optional | `localhost:9000` | Object storage host |
| `MINIO_ACCESS_KEY` | Optional | `trustdoc` | Storage access key |
| `MINIO_SECRET_KEY` | Optional | `trustdoc123` | Storage secret key |

### Frontend (`frontend_trust-main/.env.local` or Cloud Settings)

| Variable | Required | Production Value | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Required** | `https://your-backend-api.onrender.com` | Base URL pointing to running FastAPI backend |

---

## 🐳 Deployment Method 1: Docker Compose (One-Command Full Stack)

The root [`docker-compose.yml`](./docker-compose.yml) provisions the complete distributed environment:

```bash
docker compose up -d --build
```

### Access Points:
- **Frontend Portal**: `http://localhost:3000`
- **FastAPI Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **MinIO Console**: `http://localhost:9001` (User: `trustdoc`, Pass: `trustdoc123`)

To stop the containers:
```bash
docker compose down
```

---

## ☁️ Deployment Method 2: Vercel (Frontend) + Render (Backend)

### Step 2.1: Deploy Backend on Render
1. Sign in to [Render.com](https://render.com/).
2. Create a new **Web Service** connected to `https://github.com/ashishHack2/TrustDoc`.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```
     DATABASE_URL=sqlite:///./trustdoc.db
     CORS_ORIGINS=*
     JWT_SECRET=super-secure-production-random-key-here
     JWT_REFRESH_SECRET=super-secure-production-refresh-key-here
     DEMO_MODE=true
     ```
4. Copy your backend URL: e.g., `https://trustdoc-api.onrender.com`.

### Step 2.2: Deploy Frontend on Vercel
1. Sign in to [Vercel.com](https://vercel.com/) and click **Add New Project**.
2. Select repository `ashishHack2/TrustDoc`.
3. Configure project:
   - **Root Directory**: `frontend_trust-main`
   - **Framework Preset**: `Next.js`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://trustdoc-api.onrender.com` (from Step 2.1)
4. Click **Deploy**. Vercel will build and launch Next.js with zero errors.

---

## 🌐 Deployment Method 3: Netlify (Frontend)

The repository contains both a root [`netlify.toml`](./netlify.toml) and [`frontend_trust-main/netlify.toml`](./frontend_trust-main/netlify.toml) pre-configured with the official `@netlify/plugin-nextjs` and security headers.

### Step-by-Step Netlify Setup:
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** $\rightarrow$ **"Import an existing project"**.
3. Select **GitHub** and authorize repository: `ashishHack2/TrustDoc`.
4. Configure Build & Deploy Settings:
   - **Base directory**: `frontend_trust-main`
   - **Package directory**: (leave blank)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: (auto-managed by `@netlify/plugin-nextjs`)
5. Configure Environment Variables (under **"Site settings"** $\rightarrow$ **"Environment variables"**):
   | Key | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://trustdoc.onrender.com` | Points to your live Render backend |
   | `NODE_VERSION` | `18` | Recommended Node.js runtime |
6. Click **"Deploy site"**.
7. Netlify will build the Next.js frontend, deploy serverless edge functions, and provide a live HTTPS URL (e.g., `https://trustdoc.netlify.app`).

---

## 🖥️ Deployment Method 4: Ubuntu / Linux VPS (systemd + Nginx)

### 1. Backend Service (`/etc/systemd/system/trustdoc.service`)
```ini
[Unit]
Description=TRUSTDOC FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/TrustDoc/backend
ExecStart=/var/www/TrustDoc/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
Environment="DATABASE_URL=sqlite:////var/www/TrustDoc/backend/trustdoc.db"
Environment="CORS_ORIGINS=https://trustdoc.yourdomain.com"
Environment="JWT_SECRET=your-production-secret-key"

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now trustdoc
```

### 2. Frontend Build
```bash
cd /var/www/TrustDoc/frontend_trust-main
npm install
npm run build
```

---

## 🛡️ Default Demo Administrator Credentials

When `DEMO_MODE=true`, the platform auto-provisions:

| Field | Value |
|---|---|
| **Email** | `admin@trustdoc.gov.in` |
| **Password** | `TrustDoc2026!` |
| **Role** | Chief Verification Officer (Admin) |

---

## ✅ Post-Deployment Verification Checklist

- [ ] `GET /health` returns `{"status": "ok", "service": "TRUSTDOC API"}`
- [ ] `GET /docs` displays Swagger OpenAPI interface
- [ ] Next.js Frontend loads at root URL with Tactical HUD
- [ ] Live OpenCV WebRTC Camera stream initializes with Laplacian focus overlay
- [ ] Multi-Spectral ELA & Sobel filters render forensic heatmaps
- [ ] ICAO 9303 MRZ Checksum validator passes on genuine identity documents
