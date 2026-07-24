# Internship Applicant Management API

A production-ready REST API for managing internship applications, built with **NestJS**, **Prisma**, and **Supabase (PostgreSQL)**.

---

## 🚀 Technologies Used

| Technology | Purpose |
|---|---|
| **NestJS 10** | Backend framework with TypeScript |
| **Prisma 5** | ORM + migrations + type-safe queries |
| **Supabase (PostgreSQL)** | Cloud-hosted relational database |
| **JWT + Passport** | Bearer token authentication |
| **bcrypt** | Secure password hashing |
| **class-validator** | DTO request validation |
| **Swagger / OpenAPI 3** | Interactive API documentation |
| **Jest** | Unit testing |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase connection string (with `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct URL (no pgbouncer, used for migrations) |
| `JWT_SECRET` | Strong random string (`openssl rand -base64 64`) |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `PORT` | Server port (default: `3000`) |

> **Supabase URL format:**
> `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. Run Migrations

```bash
npm run db:migrate
```

### 4. Seed the Database

```bash
npm run db:seed
```

This creates:
- **1 admin** — `admin@intern.dev` / `Admin@1234`
- **10 sample applicants** across all tracks and statuses

### 5. Start the Server

```bash
# Development (with hot-reload)
npm run start:dev

# Production
npm run build && npm run start:prod
```

Server starts at: `http://localhost:3000`

---

## 📚 API Documentation

Interactive Swagger UI: **`http://localhost:3000/api/docs`**

### Authentication Instructions

1. Call `POST /api/auth/login` with:
   ```json
   { "email": "admin@intern.dev", "password": "Admin@1234" }
   ```
2. Copy the `accessToken` from the response
3. Click **"Authorize"** in Swagger UI
4. Enter: `Bearer <your-token>`
5. All protected endpoints are now accessible

---

## 🏗️ Architecture

```
src/
├── auth/           # Login, JWT strategy, guard, decorators
├── applicants/     # CRUD, status/notes management, pagination, filtering
├── dashboard/      # Summary statistics
├── common/         # Global exception filter, response interceptor, decorators
├── config/         # Environment configuration factory
├── prisma/         # PrismaService (singleton, global module)
└── main.ts         # Bootstrap: Swagger, ValidationPipe, CORS, global prefix
```

### Key Design Decisions

- **Global JWT Guard**: Applied at the app level via `APP_GUARD`. Routes that don't need auth are decorated with `@Public()`.
- **Soft Delete**: `deletedAt` timestamp — all queries filter `deletedAt: null`. Deleted records never appear in lists or statistics.
- **Business Logic in Services**: Controllers are thin — all validation, business rules (status transitions, unique email, notes limit) live in service classes.
- **Centralized Error Handling**: `GlobalExceptionFilter` intercepts all exceptions including Prisma errors, returning consistent JSON error shapes.
- **Paginated Responses**: List endpoints return `{ data: [...], meta: { total, page, limit, totalPages } }`.

---

## 🔗 Endpoints Summary

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → JWT token |
| GET | `/api/auth/me` | Bearer | Current admin profile |

### Applicants
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/applicants` | Bearer | Create applicant |
| GET | `/api/applicants` | Bearer | Paginated list (search, filter, sort) |
| GET | `/api/applicants/:id` | Bearer | Single applicant |
| PATCH | `/api/applicants/:id` | Bearer | Update applicant |
| DELETE | `/api/applicants/:id` | Bearer | Soft-delete |
| PATCH | `/api/applicants/:id/status` | Bearer | Update status |
| PATCH | `/api/applicants/:id/notes` | Bearer | Update notes |

### Dashboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Bearer | Statistics |

### Query Parameters (GET /api/applicants)
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | — | Search first/last name or email |
| `status` | enum | — | Filter by status |
| `track` | enum | — | Filter by track |
| `sortBy` | string | createdAt | Sort field |
| `sortOrder` | asc/desc | desc | Sort direction |

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### What's Tested

- **AuthService** — login success, wrong password, user not found, getMe
- **ApplicantsService** — create (unique email), findOne (not found), soft-delete, status transitions (including Rejected→Accepted block), notes length
- **DashboardService** — summary aggregation, zero-defaults

---

## 📋 Business Rules

| Rule | Enforcement |
|---|---|
| Email must be unique | DB unique constraint + `ConflictException` in service |
| Notes max 1000 chars | `@MaxLength(1000)` in DTO + service guard |
| No Rejected → Accepted | `validateStatusTransition()` in service |
| Auth required for mutations | Global `JwtAuthGuard` |
| Soft-delete only | `deletedAt` timestamp, never `DELETE` |
| Deleted excluded from lists | All queries filter `deletedAt: null` |

---

## ⚠️ Assumptions & Known Limitations

- **Single admin role**: No RBAC — any authenticated administrator has full access.
- **No file upload**: `resumeUrl` is a plain text URL field; actual file hosting is external.
- **Supabase required**: The app uses PostgreSQL-specific features. SQLite is not supported with Prisma and Supabase simultaneously.
- **Password reset**: Not implemented (out of scope).
- **Rate limiting**: Not implemented (add `@nestjs/throttler` for production).

---

## 📝 Migration & Seed Commands

```bash
npm run db:migrate        # Run all pending migrations
npm run db:migrate:dev    # Create and apply migration in dev
npm run db:seed           # Seed database with sample data
npm run db:studio         # Open Prisma Studio (visual DB browser)
npm run db:generate       # Regenerate Prisma Client after schema changes
```
