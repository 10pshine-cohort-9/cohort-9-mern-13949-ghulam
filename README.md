# Notes App

A full-stack notes application built with a React (Vite) frontend and a Node.js/Express + PostgreSQL backend. Users can sign up, log in, and create, edit, search, color-tag, and delete rich-text notes, plus manage their profile.

## Features

- Email/password signup and login, secured with JWT and bcrypt-hashed passwords
- Create, edit, delete, and search notes
- Rich-text note editor (bold, italic, lists, links, highlights, alignment, and more) built on Tiptap
- Color-tagged notes
- Paginated note detail view for long notes
- User profile management: update name/email, change password, delete account

## Tech Stack

**Frontend:** React 18, React Router, Vite, Tiptap (rich text editor), Axios, DOMPurify

**Backend:** Node.js, Express, PostgreSQL (`pg`), JWT auth, bcrypt, Pino (logging)

**Testing:** Mocha + Chai + Supertest (backend, against a real database), Jest + React Testing Library (frontend, with the service layer mocked)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/        # database connection
│   │   ├── controllers/   # request handlers
│   │   ├── logger/        # Pino logger setup
│   │   ├── middleware/    # auth middleware, error handler
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # business logic / DB queries
│   │   ├── utils/         # helpers
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # entry point
│   └── tests/             # Mocha/Chai/Supertest integration tests
└── frontend/
    └── src/
        ├── api/           # Axios client
        ├── components/    # NoteCard, NoteDetailModal, RichTextEditor, etc.
        ├── context/       # React context providers
        ├── hooks/         # custom hooks
        ├── layouts/       # page layout wrappers
        ├── lib/           # small utilities (e.g. HTML pagination)
        ├── pages/         # Login, Signup, Dashboard, Profile
        ├── services/      # auth.service, notes.service (API calls)
        └── styles/        # per-page/component CSS
```

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or reachable) with a database created for this app

## Setup

### 1. Database

Create a database and the two tables the app needs:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#ffffff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev            # http://localhost:5000
```

`.env` variables:

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` | PostgreSQL connection details |
| `PG_CONNECTION_TIMEOUT_MS` | DB connection timeout |
| `JWT_SECRET` | Long, random secret used to sign auth tokens |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor |
| `LOG_LEVEL` | Pino log level |
| `CORS_ORIGIN` | Origin allowed to call the API (the frontend's dev URL) |

The server refuses to start if `JWT_SECRET`/`PG_PASSWORD` are still the placeholder values from `.env.example`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Running Tests

```bash
# Backend — integration tests against a real Express app + real database
npm --prefix backend test

# Frontend — component tests with the service layer mocked
npm --prefix frontend test
```

## API Reference

All routes are prefixed with `/api/auth` for auth, and `/notes` for notes. Note routes require an `Authorization: Bearer <token>` header.

**Auth**

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/auth/profile` | Get the logged-in user's profile |
| PUT | `/api/auth/profile` | Update name/email |
| PUT | `/api/auth/password` | Change password |
| DELETE | `/api/auth/profile` | Delete the account |

**Notes**

| Method | Path | Description |
|---|---|---|
| POST | `/notes` | Create a note |
| GET | `/notes` | List the logged-in user's notes |
| GET | `/notes/:noteId` | Get a single note |
| PUT | `/notes/:noteId` | Update a note |
| DELETE | `/notes/:noteId` | Delete a note |
