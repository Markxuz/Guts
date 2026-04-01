# Changelog

All notable changes to this backend are documented in this file.

## [Unreleased]

### Added

- Week 2 operational hardening:
  - Structured JSON logging
  - Request tracing via request IDs
  - Health and readiness endpoints
  - Backup monitor and restore drill scripts
  - Expanded activity logs for user administration actions
- Enrollment creation now emits notifications with actor context.
- Enrollment progress changes now emit user-facing status notifications (`Pending`, `Active`, `Complete`).
- Notification endpoints now support staff access in addition to admin/sub-admin.

### Changed

- Backup script now writes `backup-status.json` and supports optional webhook alerts.
- Dashboard summary query fixed to remove invalid selected schedule field that caused SQL errors.
- Dashboard summary totals normalized to enrollment-based counting to prevent duplicated counts.
- Daily reports now include richer enrollment schedule context (slot, vehicle type, instructor, care-of instructor).

## [1.0.0]

- Initial backend release.
