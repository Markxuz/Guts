# Release Checklist

## Pre-Release

1. Confirm migrations run cleanly:
   - `npm run migrate`
2. Run contract tests:
   - `npm test`
3. Validate health endpoints:
   - `GET /api/health`
   - `GET /api/health/ready`
4. Verify backup pipeline:
   - `npm run backup:db`
   - `npm run backup:monitor`
5. Run restore drill (staging or production-like):
   - `npm run backup:restore-test`

## Release

1. Tag release version.
2. Update [CHANGELOG.md](../CHANGELOG.md) under an explicit version heading.
3. Deploy app and run migrations.
4. Smoke test auth, users, enrollments, schedules, reports.
5. Run [remarks flow regression checklist](./remarks-flow-regression-checklist.md).

## Post-Release

1. Monitor structured logs for 30 minutes.
2. Confirm no sustained 5xx errors.
3. Confirm next scheduled backup succeeds.
4. Capture release notes and rollback status.
