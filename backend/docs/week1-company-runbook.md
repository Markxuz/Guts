# Week 1 Company Runbook

## 1) One-Time Setup

1. Create `.env` from `.env.example`.
2. Set strong values for:
   - `JWT_SECRET`
   - `SEED_ADMIN_PASSWORD`
   - `SEED_STAFF_PASSWORD`
3. Keep `DB_SYNC=false`.
4. Run migrations:
   - `npm run migrate`
5. Start backend:
   - `npm start`

## 2) Rotate Temporary Seed Passwords

After initial startup, change temporary seed passwords immediately:

- Endpoint: `POST /api/auth/change-password`
- Example body:

```json
{
  "email": "admin@guts.local",
  "currentPassword": "ChangeMe!Admin123",
  "newPassword": "CompanyStrong#Admin2026"
}
```

## 3) Internal Access Enforcement

1. Keep app reachable only over VPN/internal network.
2. Do not expose DB port publicly.
3. Set `CORS_ALLOWED_ORIGINS` to approved internal frontend URLs only.

## 4) Daily Backup

Run backup script:

```bash
npm run backup:db
```

Config values:

- `BACKUP_DIR` (default `./backups`)
- `BACKUP_RETENTION_DAYS` (default `14`)

## 5) Schedule Backup (Windows Task Scheduler)

Create daily task:

1. Program/script: `powershell.exe`
2. Arguments:

```powershell
-NoProfile -ExecutionPolicy Bypass -Command "Set-Location 'C:\Users\G\Guts\backend'; npm run backup:db"
```

3. Trigger: Daily (e.g., 2:00 AM)
4. Run whether user is logged on or not

## 6) Week 1 Verification Checklist

- [ ] `npm run migrate` completed successfully
- [ ] Backend starts without schema sync errors
- [ ] Login lockout returns `429` after repeated failed attempts
- [ ] Seed credentials changed to company-managed passwords
- [ ] Daily backup task exists and generated `.sql` file
- [ ] At least one restore test was done on a test DB
