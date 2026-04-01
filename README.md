# College Document Management System

A full-stack web application where students request official college documents and authorities process them through role-based workflows.

## Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt
- **PDF:** pdfkit
- **Deployment:** Render (frontend and backend as separate services)

## Folder Structure

```
client/   # React frontend
server/   # Express backend
```

## Features

- JWT signup/login with role-based access
- Roles: Student, HOD, Registrar, Finance, Admin
- Student dashboard with sidebar, request form, status tracking, PDF download
- Authority dashboards with sidebar, assigned request list, approve/reject and comments
- Routing logic:
  - Bonafide → HOD
  - LOR → HOD
  - NOC → Registrar
  - No Dues → Finance
  - Fee Structure → Finance
- Dynamic PDF generation for approved requests

## Local Setup

### 1) Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Requests
- `POST /api/requests` (student)
- `GET /api/requests/my` (student)
- `GET /api/requests/assigned` (authority)
- `PATCH /api/requests/:id/status` (authority)
- `GET /api/requests/:id/pdf` (approved only)

## Render Deployment

### Backend (Web Service)
1. Create a new Web Service from your GitHub repo.
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your frontend URL)
   - `PORT` (Render sets this automatically)

### Frontend (Static Site)
1. Create a new Static Site from the same repo.
2. Root directory: `client`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Environment variable:
   - `VITE_API_URL` = your Render backend URL + `/api`

## Production Notes

- Use strong JWT secret in production.
- Restrict signup role assignment in production (recommended via admin-only user creation).
- Add email notification service and audit logs for enterprise-grade usage.
- Add request input validation and rate limiting for hardened deployment.
