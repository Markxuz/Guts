# Week 2 Operations Runbook

## Scope

This runbook covers Week 2 reliability goals:

1. Structured logs for troubleshooting.
2. Health/readiness checks for monitoring.
3. Backup freshness checks and restore drill.
4. Expanded audit logs for user admin actions.

## 1) Health Monitoring

### Endpoints

- Liveness: `GET /api/health`
- Readiness: `GET /api/health/ready`

### Expected behavior

- `/api/health` returns 200 with uptime/version metadata.
- `/api/health/ready` returns:
  - 200 when DB is reachable
  - 503 when DB is unreachable

## 2) Structured Logging

All logs are JSON lines with:

- timestamp
- level
- message
- request metadata (path, method, status, duration)

Configure using:

- `LOG_LEVEL=debug|info|warn|error`
- `REQUEST_LOG_INCLUDE_HEALTH=true|false`

## 3) Backup Reliability Checks

### Daily backup

```bash
npm run backup:db
```

This writes:

- SQL dump file into `BACKUP_DIR`
- `backup-status.json` with last run result

### Freshness monitor

```bash
npm run backup:monitor
```

Fails if latest backup age exceeds `BACKUP_MAX_AGE_HOURS`.

### Restore drill test

```bash
npm run backup:restore-test
```

Process:

1. Picks latest `.sql` backup.
2. Restores to a temporary DB (`BACKUP_RESTORE_TEST_DB_PREFIX_*`).
3. Validates restored table count query.
4. Drops temp DB when `BACKUP_RESTORE_TEST_CLEANUP=true`.

## 4) Audit Log Coverage

Week 2 adds activity logs for:

- user creation
- role changes
- user deletion
- password change endpoint usage

## 5) Scheduler Recommendations

Set scheduled jobs:

1. `backup:db` daily (e.g., 2:00 AM)
2. `backup:monitor` every 30-60 minutes
3. `backup:restore-test` weekly (off-peak)

## 6) Week 2 Acceptance Checklist

- [ ] `/api/health` and `/api/health/ready` integrated with monitoring
- [ ] JSON logs visible in runtime output
- [ ] `backup:monitor` fails when backups are stale
- [ ] `backup:restore-test` passes at least once in staging/prod-like env
- [ ] Backup alert webhook is configured (optional but recommended)
- [ ] User management actions appear in activity logs
