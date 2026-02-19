# Rep AI SaaS Skeleton (Next.js 16)

This app now includes:

- **Auth.js (NextAuth v5)** with credentials sign-up/sign-in
- **Neon Postgres** + **Drizzle ORM**
- Per-user data for profile, leads, and credits
- Route/API protection via middleware

## Required environment variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_TRUST_HOST="true"
# Optional auth providers
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

## Setup

```bash
bun install
bun db:push
bun dev
```

## Auth flow

- Sign up at `/auth/signup`
- Sign in at `/auth/signin`
- `/dashboard`, `/api/chat`, `/api/profile`, and `/api/leads` require authentication.

## Database schema

Defined in `lib/schema.ts`:

- `users` (id, email, name, plan, credits + auth fields)
- `leads` (id, name, email, company, userId, createdAt)
- Auth.js tables: `accounts`, `sessions`, `verification_tokens`
