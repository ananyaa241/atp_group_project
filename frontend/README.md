# MediCare+ — Frontend

React 19 + Vite 8 + Tailwind CSS 4 frontend for the MediCare+ Hospital Management System.

> **Full setup instructions are in the root [`README.md`](../README.md). Read that first.**

---

## Quick Start (Frontend only)

```bash
# Install dependencies
npm install

# Copy environment file
copy .env.example .env        # Windows CMD
Copy-Item .env.example .env   # PowerShell
cp .env.example .env          # Mac/Linux

# Start dev server
npm run dev
```

App runs at → **http://localhost:5173**

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## Key Packages

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests (via centralised `axiosInstance`) |
| `framer-motion` | Page transitions and animations |
| `react-hook-form` | Form validation |
| `react-hot-toast` | Toast notifications |
| `recharts` | Dashboard analytics charts |
| `react-icons` | SVG icons (no emojis) |
| `tailwindcss` | Utility-first CSS |

---

## Folder Structure

```
src/
├── api/
│   └── axiosInstance.js      # Centralised axios — always import this
├── components/
│   ├── admin/                # AdminDashboard
│   ├── appointment/          # Appointments, AppointmentForm, CalendarView
│   ├── common/               # Header, Footer, Sidebar, Loader, EmptyState…
│   ├── doctor/               # Doctors, DoctorDashboard
│   ├── patient/              # PatientList, PatientDashboard
│   └── prescription/         # Prescription
├── context/
│   └── AuthContext.jsx       # token, role, user — login(), logout()
├── layouts/
│   ├── MainLayout.jsx        # Public pages (Header + Footer)
│   └── DashboardLayout.jsx   # Protected pages (Sidebar + main)
├── pages/
│   ├── Dashboard.jsx         # Routes to correct dashboard by role
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   └── Unauthorized.jsx
├── routes/
│   └── ProtectedRoute.jsx    # JWT + role guard
├── App.jsx                   # Route definitions
├── index.css                 # Design tokens + global styles
└── main.jsx                  # Entry point — AuthProvider + Toaster
```

---

## Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `http://localhost:5000` |

---

## Development Notes for Teammates

- **Never import plain `axios`** — always use `import axiosInstance from '../api/axiosInstance'`. It automatically attaches the JWT token and handles 401 redirects.
- **Always use `toast.success()` / `toast.error()`** — never `alert()`.
- **Use `useForm()` from `react-hook-form`** for any new forms.
- **Wrap new pages with `<motion.div initial...>`** from framer-motion for consistent page transitions.
- **Use `<Loader />`** for async loading states and **`<EmptyState />`** for empty arrays.
- **Dark mode**: all new components must include `dark:` variants for background and text colours.
