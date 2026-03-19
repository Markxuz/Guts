## Database Setup (New PC)

1. Install dependencies:
   - `npm install`
2. Create an empty MySQL database (example):
   - `CREATE DATABASE your_database_name;`
3. Create your environment file:
   - Copy `.env.example` to `.env`
   - Set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_HOST`
4. Run migrations:
   - `npm run migrate`
5. Start the backend:
   - `npm start`

## Week 1 Hardening Defaults

- Startup does not auto-sync schema by default. Keep `DB_SYNC=false` and use migrations.
- Login is rate-limited to reduce brute-force attempts.
- Passwords require strong complexity (min 10 chars with upper/lower/number/symbol).
- Seeded default users are marked `must_change_password` and blocked from normal login until changed.

## Password Rotation for Seeded Accounts

Use this endpoint to replace temporary default passwords:

- `POST /api/auth/change-password`
- Body:
  - `{ "email": "admin@guts.local", "currentPassword": "ChangeMe!Admin123", "newPassword": "YourStrong#Password1" }`

## Daily Backup Command

- Run manually:
  - `npm run backup:db`
- Configure scheduler (Windows Task Scheduler / Linux cron) to run once daily.

## Week 2 Operations

- Liveness endpoint:
   - `GET /api/health`
- Readiness endpoint (includes DB check):
   - `GET /api/health/ready`

Backup reliability checks:

- Freshness monitor:
   - `npm run backup:monitor`
- Restore drill test (latest backup to temp DB):
   - `npm run backup:restore-test`

Structured logging:

- Logs are emitted as JSON lines.
- Configure verbosity using `LOG_LEVEL` in `.env`.
