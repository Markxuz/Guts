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

## Recent Backend Updates (April 2026)

### Notifications and Role Flow

- Notifications now support `admin`, `sub_admin`, and `staff` access on notification endpoints.
- Creating an enrollment now creates a notification entry with actor context.
- Enrollment progress updates (`pending`, `confirmed`, `completed`) now create notifications for cross-role visibility.
- Status labels shown in notification messages are normalized to user-facing labels:
   - `pending` -> `Pending`
   - `confirmed` -> `Active`
   - `completed` -> `Complete`

### Dashboard and Reports Data Reliability

- Fixed dashboard summary query failure caused by selecting a non-existent schedule column.
- Normalized dashboard summary counting to enrollment-based totals to avoid inflated metrics.
- Daily report enrollment rows now include schedule-linked fields (session slot, vehicle type, instructor, care-of instructor) when available.

### API Notes

- Notification feed remains global (not recipient-scoped) in the current implementation.
- Recent activity logs and notifications are both available, but they are separate streams with different use-cases.

### Scheduled Report Emails

- Report schedules persist in the `report_schedules` table.
- The backend can send scheduled report emails when SMTP settings are provided.
- Without SMTP settings, the worker falls back to a local JSON preview transport so the flow can still be tested safely.
- Optional settings:
   - `REPORT_EMAIL_WORKER_ENABLED`
   - `REPORT_EMAIL_POLL_INTERVAL_MS`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`
