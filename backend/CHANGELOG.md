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

### Changed

- Backup script now writes `backup-status.json` and supports optional webhook alerts.

## [1.0.0]

- Initial backend release.
