# Backend — AI Gig Insurance

This backend provides simple authentication endpoints using MySQL for the AI Gig Insurance project.

Requirements
- Node 18+
- MySQL server

Quick start

1. Create a `.env` in `backend/` (use `.env.example` as a template).

2. Initialize the database (run the SQL script):

```sql
-- from your mysql client
SOURCE ./backend/scripts/init.sql;
```

3. Install and run the server:

```bash
cd backend
npm install
npm run dev
```

API
- POST `/api/auth/register` — body: `{name, email?, phone, password, platform?}` — returns `{id, token}`
- POST `/api/auth/login` — body: `{identifier, password}` where `identifier` is email or phone — returns user info and `{token}`

Notes
- Passwords are hashed using `bcryptjs`.
- Tokens are JWT signed with `JWT_SECRET` from the environment.
