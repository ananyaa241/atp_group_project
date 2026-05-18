Deployment steps — Backend on Render, Frontend on Vercel

Overview
- Deploy the backend (this repo's `backend/`) to Render as a Web Service.
- Deploy the frontend (this repo's `frontend/`) to Vercel; set `VITE_API_URL` to the Render service URL.

Backend (Render)
1. In Render dashboard, create a new "Web Service" from your repository branch.
2. Build/Start settings:
   - Build Command: leave empty (Node app)
   - Start Command: `npm run start` (or `node server.js`) — `backend/package.json` already has `start` script.
   - Environment: select `Node` and choose the region.
3. Environment variables to set on Render (Settings → Environment):
   - `DB_URL` — MongoDB connection string
   - `JWT_SECRET` — JWT signing secret
   - `FRONTEND_URL` — the Vercel frontend URL (https://your-site.vercel.app)
   - Optionally: `ALLOWED_ORIGINS` — comma-separated origins if you prefer
   - Any cloudinary / mailer credentials used in `config/`
4. Health checks: Render will probe `/` by default; the backend exposes `/` and `/health`.
5. After deploy, note the service URL (e.g. `https://my-backend.onrender.com`).

Frontend (Vercel)
1. In Vercel dashboard, import the `frontend/` project from the same repository.
2. In Vercel project settings → Environment Variables, set:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com` (use the full https URL)
3. Build & Output settings: default Vite build is usually `npm run build` (check `frontend/package.json`).
4. Deploy. The frontend will use `import.meta.env.VITE_API_URL` at build time.

Notes & Security
- The backend CORS already reads `FRONTEND_URL` and `ALLOWED_ORIGINS` from environment variables; set these values on Render.
- Doctor registration is now admin-only — when deploying, ensure you create at least one admin account (use the `Register` page selecting Admin, or seed an admin in DB) so you can add doctors.
- If you want automatic DB seeding, add a small migration script and run it on Render via a one-off job.

Troubleshooting
- If frontend cannot reach backend: verify `VITE_API_URL` is exactly the backend URL and there's no trailing slash issues.
- Check Render service logs for CORS or JWT errors.

Example quick commands (local testing)

# Start backend locally
cd backend
npm install
npm run start

# Start frontend locally (Vite)
cd frontend
npm install
npm run dev

If you want, I can:
- Add a small README entry under `backend/README.md` and `frontend/README.md`.
- Create a database-seed script that creates an initial admin account.
- Add CI/CD configuration for Render/Vercel.
