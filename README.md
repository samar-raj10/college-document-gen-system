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
- Public signup always creates Student accounts
- Admin-only user creation and dynamic role management
- Seeded system roles: Student, HOD, Registrar, Finance, Admin
- Admins can create additional custom roles such as Dean, Librarian, or Placement Officer
- Student dashboard with sidebar, request form, and active request status tracking
- Student Document Vault for approved/generated documents and PDF downloads
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

### Admin
- `GET /api/admin/roles` (admin)
- `POST /api/admin/roles` (admin creates a custom role)
- `PATCH /api/admin/roles/:id` (admin renames non-system roles)
- `DELETE /api/admin/roles/:id` (admin deletes unused non-system roles)
- `GET /api/admin/users` (admin)
- `POST /api/admin/users` (admin creates a user with any existing role)
- `PATCH /api/admin/users/:id/role` (admin assigns any existing role)

### Requests
- `POST /api/requests` (student)
- `GET /api/requests/my` (student)
- `GET /api/requests/vault` (student approved documents)
- `GET /api/requests/assigned` (authority)
- `PATCH /api/requests/:id/status` (authority)
- `GET /api/requests/:id/pdf` (approved only)

## Role Management

Roles are stored in MongoDB in a dedicated `roles` collection with a human-readable `name`, normalized unique `key`, and `isSystem` flag. On server startup, the system seeds Student, HOD, Registrar, Finance, and Admin roles so existing user role strings continue to work. System roles are protected from rename/delete in the Admin Dashboard, while custom roles can be created, renamed, deleted when unused, and assigned to users.

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
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the initial admin seed when no admin exists
   - `ADMIN_NAME` and `ADMIN_DEPARTMENT` (optional)
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
- Public signup is restricted to Student accounts; use Admin user management for all role creation and assignment.
- Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` during first deployment to seed or promote the initial admin account, then rotate/remove the seed password from the runtime environment after confirming access.
- Add email notification service and audit logs for enterprise-grade usage.
- Add request input validation and rate limiting for hardened deployment.
