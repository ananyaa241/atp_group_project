#                       MediCare+ — Hospital Management System

<div align="center">

![MediCare+](https://img.shields.io/badge/MediCare+-Hospital%20Management-06b6d4?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A polished full-stack hospital management solution** with role-based dashboards, unified API integration, modern UI, analytics, and responsive mobile-first design.

</div>

---

## ?? Table of Contents

- [Overview](#-overview)
- [? Features](#-features)
- [?? Tech Stack](#-tech-stack)
- [?? Project Structure](#-project-structure)
- [?? Setup Instructions](#-setup-instructions)
- [?? Environment Variables](#-environment-variables)
- [?? User Roles & Permissions](#-user-roles--permissions)
- [?? Default Ports](#-default-ports)
- [?? Troubleshooting](#-troubleshooting)
- [?? Notes](#-notes)
- [?? Contributing](#-contributing)
- [?? License](#-license)

---

## ?? Overview

**MediCare+** is a professional-grade hospital management system built for healthcare teams. The platform supports:

- **Admins**: manage users, analytics, appointments, and system settings
- **Doctors**: manage schedules, prescriptions, and patient records
- **Patients**: book appointments, view medical history, and access prescriptions

The app is designed with security, scalability, and modern UX best practices in mind.

---

## ? Features

| Feature | Description |
|---|---|
| ?? Role-Based Authentication | Secure JWT login with role-aware access control |
| ?? Appointment Scheduling | Create, view, search, and manage appointments |
| ?? Doctor Management | Search by specialization, view profiles, manage availability |
| ???????? Patient Management | Manage patient records, history, and health vitals |
| ?? Prescription Workflow | Create prescriptions with dosage, duration, and notes |
| ?? Analytics Dashboard | Charts for trends, doctor distribution, and appointment stats |
| ?? Dark Mode Support | UI theme toggle for light/dark mode |
| ?? Responsive Layout | Mobile-first design with responsive sidebar and navbar |
| ?? Toast Notifications | User-friendly success/error notifications |
| ?? Centralized API | Axios instance with token interceptor and base URL management |
| ?? Form Validation | React Hook Form for validated, professional forms |
| ?? PDF Export | Prescription export support for professional reports |
| ?? Error Handling | Error boundaries and empty states for robust UX |

---

## ?? Tech Stack

### Backend

| Technology | Role |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API server |
| MongoDB | Database storage |
| Mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| nodemailer | Email notifications |
| multer | File upload handling |
| cloudinary | Image storage |
| node-cron | Scheduled reminder jobs |
| dotenv | Environment variable management |
| cors | Cross-origin resource sharing |

### Frontend

| Technology | Role |
|---|---|
| React | UI library |
| Vite | Development build tool |
| Tailwind CSS | Styling framework |
| React Router DOM | Client routing |
| Axios | HTTP client |
| React Hot Toast | Toast notifications |
| React Hook Form | Form validation |
| Framer Motion | Animations |
| Recharts | Dashboard charts |
| React Icons | SVG icon components |

---

## ?? Project Structure

```
group project/
+-- backend/
¦   +-- APIs/
¦   +-- config/
¦   +-- middlewares/
¦   +-- models/
¦   +-- server.js
¦   +-- package.json
¦   +-- .env
¦   +-- *.http
+-- frontend/
¦   +-- public/
¦   +-- src/
¦   ¦   +-- api/
¦   ¦   ¦   +-- axiosInstance.js
¦   ¦   +-- components/
¦   ¦   +-- context/
¦   ¦   +-- layouts/
¦   ¦   +-- pages/
¦   ¦   +-- routes/
¦   ¦   +-- App.jsx
¦   ¦   +-- main.jsx
¦   ¦   +-- index.css
¦   +-- package.json
¦   +-- .env.example
+-- .gitignore
+-- README.md
```

---

## ?? Setup Instructions

### Clone the repository

```bash
git clone https://github.com/ananyaa241/ATP_24EG105Q08.git
cd "group project"
```

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

> Ensure the backend is running before starting the frontend so data requests connect properly.

---

## ?? Environment Variables

### Backend `.env`

```env
PORT=5000
DB_URL=mongodb://127.0.0.1:27017/hospital
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## ?? User Roles & Permissions

| Role | Access Level |
|---|---|
| Admin | Full control over users, doctors, patients, appointments, and analytics |
| Doctor | Manage appointments, prescriptions, and patient interactions |
| Patient | Book appointments, view prescriptions, and access health records |

---

## ?? Default Ports

| Service | Default Port |
|---|---|
| Backend | `5000` |
| Frontend | `5173` |

---

## ?? Troubleshooting

- If the frontend cannot fetch data, verify `VITE_API_URL` matches the backend.
- If login fails, clear browser storage and retry.
- If MongoDB cannot connect, confirm your `DB_URL` and database status.
- Use backend `.http` files for direct API testing.

---

## ?? Notes

- The frontend uses a shared Axios instance for all API requests.
- Forms are structured for validation and reusable error handling.
- The dashboard is designed for role-based, professional hospital workflows.
- Use modern UI components, toast alerts, loading states, and responsive design.

---

## ?? Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request

---

## ?? License

This repository is currently a learning and demonstration project. Update the license section if you use this code in production.
