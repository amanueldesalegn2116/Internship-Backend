# 🚀 Internship Applicant Management API (Backend)

An enterprise-grade RESTful API for managing internship applications built with **NestJS**, **Prisma ORM**, and **Supabase PostgreSQL**. Includes bearer-token authentication, soft-deletes, business-rule validation, dashboard metrics, and interactive OpenAPI (Swagger) documentation.

---

## 🛠️ Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma 7](https://www.prisma.io/) (with `@prisma/adapter-pg`)
- **Authentication**: JWT Bearer Tokens (`@nestjs/jwt`, `passport-jwt`, `bcrypt`)
- **API Documentation**: [Swagger / OpenAPI 3.0](https://swagger.io/)
- **Validation & Transformation**: `class-validator`, `class-transformer`
- **Testing**: Jest & Supertest

---

## ✨ Features & Business Rules

1. **Administrator Authentication**:
   - `POST /api/auth/login`: Administrator bearer-token login with bcrypt password comparison.
   - `GET /api/auth/me`: Fetch authenticated admin profile details.
   - Secured with a global `JwtAuthGuard` (endpoints bypass authentication via `@Public()` decorator).

2. **Applicant Management (CRUD)**:
   - `POST /api/applicants`: Create applicant with unique email verification.
   - `GET /api/applicants`: Paginated list of applicants supporting search by candidate name or email, track filtering, status filtering, and custom sorting.
   - `GET /api/applicants/:id`: Single applicant profile lookup.
   - `PATCH /api/applicants/:id`: Partial update of applicant profile fields.
   - `DELETE /api/applicants/:id`: **Soft-delete** implementation (`deletedAt` field). Soft-deleted records are automatically excluded from list queries and stats.

3. **Enforced Business Logic**:
   - `PATCH /api/applicants/:id/status`: Status update with transition rules. **Direct transition from `Rejected` → `Accepted` is strictly prohibited**.
   - `PATCH /api/applicants/:id/notes`: Internal interviewer notes constrained to a **maximum of 1,000 characters**.

4. **Dashboard Summary Analytics**:
   - `GET /api/dashboard/summary`: Aggregates active applicant count, distribution by status (`Pending`, `Shortlisted`, `Accepted`, `Rejected`), distribution by track, and recent submissions.

5. **API Documentation**:
   - Interactive Swagger UI available at `http://localhost:3000/api/docs`.

---

## 📋 Prerequisites

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Database**: Supabase PostgreSQL database instance

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `/backend` directory based on `.env.example`:

```env
NODE_ENV=development
PORT=3000

# Supabase Session Pooler / Direct Database Connection String
# NOTE: If your database password contains special characters like ':', '{', or '%',
# percent-encode them (e.g. ':' -> '%3A', '{' -> '%7B')
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Secret Configuration
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Run Database Sync
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Database
Seeds the default administrator account (`admin@intern.dev` / `Admin@1234`) and 10 sample applicants:
```bash
npm run db:seed
```

### 4. Run Development Server
```bash
npm run start:dev
```
- API Base URL: `http://localhost:3000/api`
- Swagger Documentation: `http://localhost:3000/api/docs`

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

---

## 🌐 Production Deployment (Render)

This repository includes a `render.yaml` configuration file for automatic deployment on [Render](https://render.com/):

1. Create a new **Web Service** on Render connected to this repository.
2. Set Environment Variables:
   - `DATABASE_URL` (Supabase connection string)
   - `DIRECT_URL` (Supabase direct connection string)
   - `JWT_SECRET` (Random secure secret string)
3. Pre-deploy command: `npx prisma migrate deploy && npm run db:seed`
4. Start command: `npm run start:prod`

---

## 📄 License

UNLICENSED — Proprietary Internship Management System.
