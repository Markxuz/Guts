# CEO Refactor Priority Plan (Safe Rollout)

Date: 2026-04-28
Goal: Deliver the 10 requested updates with minimal production risk.

## Non-Negotiable Safety Rules

1. No direct breaking API changes in one release.
2. Use additive migrations first (add columns/tables, do not drop/rename yet).
3. Keep existing payload compatibility while frontend transitions.
4. Run contract tests and smoke tests before and after every phase.
5. Release in small batches with rollback checkpoints.

## Existing Risk Signals (Current Codebase)

- Enrollment flow already has complex branching for TDC/PDC/PROMO in backend and frontend.
- Auth is JWT-based and currently allows multi-device token reuse.
- Mobile layout has dense pages (enrollment and settings pages are high-risk for visual regressions).
- Release checklists and runbooks already exist and should be followed strictly.

## Phase 0 (Immediate, 1-2 days): Stabilization Gates Before Refactor

Scope:
- Confirm release checklist workflow is executed before each change set.
- Add/update test coverage for enrollment validation and auth session behavior.
- Create feature flags for risky behavior toggles where practical.

Deliverables:
- Baseline test pass in backend and frontend.
- Regression checklist for enrollment and schedule status paths.
- Backout plan documented per phase.

Why first:
- Prevents hidden regressions while multiple modules are being changed.

## Phase 1 (Highest Priority Functional Changes, Low-to-Medium Blast Radius)

### 1) Enrollment Question Refactor (CEO Item #2)

Required behavior:
- Remove from TDC form:
  - "Marunong ka na bang magmaneho?"
  - "Anong sasakyan ang inaanyo?"
  - "Anong klase ng transmission?"
- Move driving-experience and related fields to PDC flow.
- In package handling, ask/require these only when PDC category is Experience.

Safe implementation strategy:
- Frontend first: stop showing TDC questions.
- Backend compatibility: still accept legacy fields but do not require them for TDC.
- Validation update: require vehicle/transmission only in PDC Experience paths.
- Keep legacy values in DB accepted during transition window.

### 2) External TDC -> GUTS PDC Intake (CEO Item #3)

Required behavior:
- A student who took TDC elsewhere can enroll in GUTS PDC.

Safe implementation strategy:
- Use existing fields `driving_school_tdc` and `year_completed_tdc` as required for PDC.
- Add explicit `tdc_source` semantics (e.g., `guts` or `external`) as additive field.
- Do not block existing records with missing historical values.

### 3) Cancel Button for Status and Schedule (CEO Item #4)

Required behavior:
- Allow marking student/enrollment/schedule as cancelled when not continuing.

Safe implementation strategy:
- Add explicit cancel action endpoints or status transitions.
- Do not delete records; use state transition (`cancelled`) with audit log.
- Ensure dashboard/reports filters handle cancelled properly.

## Phase 2 (Core Data Model Extensions, Medium Blast Radius)

### 4) LTMS + Student Permit + Medical Certificate Tracking (CEO Item #5)

Safe implementation strategy:
- Additive migration for permit number/date/status and medical provider/date fields.
- Include nullable columns first, then frontend forms.
- Backfill optional defaults only where needed.

### 5) Financial Input Enhancements in Enrollment (CEO Item #8)

Safe implementation strategy:
- Define financial schema first (fees, discounts, payment terms, references).
- Add server-side validation and audit trail.
- Preserve existing payment fields while new fields are introduced.

### 6) Vehicle Odometer Delta + Fuel Consumption Tracking (CEO Item #6)

Safe implementation strategy:
- Extend fuel log model with before/after odometer or computed distance.
- Compute consumption using deterministic formula and store derived values.
- Keep current `odometer_reading` behavior to avoid breaking existing reports.

## Phase 3 (Growth/Admin Features, Lower Core Risk)

### 7) Editable Promo Page (Admin Only) (CEO Item #7)

Safe implementation strategy:
- Add promo configuration resource with role-guarded CRUD.
- Enrollment dropdown reads active promo configs.
- Validate start/end windows and status.

### 8) User Manual (CEO Item #1)

Safe implementation strategy:
- Build from actual released behavior (not planned behavior).
- Split by role: admin, staff, enrollment officer.

## Phase 4 (Cross-Cutting Risk, Must Be Isolated and Well Tested)

### 9) Single Session / Single Device Constraint (CEO Item #10)

Required behavior:
- Only one active session per account; login in another device invalidates previous session.

Safe implementation strategy:
- Add server-side session table or token versioning (`session_version` per user).
- Embed session version in JWT claims.
- On login, rotate/increment session version and invalidate old tokens.
- Add explicit logout-all and inactivity handling later.

Why last:
- Touches global auth behavior and can lock out users if implemented incorrectly.

### 10) Mobile Responsiveness Hardening (CEO Item #9)

Safe implementation strategy:
- Prioritize top traffic pages first: login, dashboard, enrollments, settings/vehicles.
- Add device-size QA matrix and visual checks before release.
- Avoid large redesign with logic changes in same release.

## Recommended Execution Order (Do Not Skip)

1. Phase 0 stabilization gates
2. Phase 1 items #2, #3, #4
3. Phase 2 items #5, #8, #6
4. Phase 3 items #7, #1
5. Phase 4 items #10, #9

## Go/No-Go Checklist per Phase

- Migrations run cleanly.
- Contract tests and key flow tests pass.
- Smoke tests pass for auth, enrollment, schedules, dashboard/reports.
- Rollback steps are verified before production deploy.
- Post-release monitoring has no sustained 5xx/auth anomalies.

## Rollback Principle

- Roll back app deployment first.
- Keep additive DB migrations in place unless data integrity requires reversal.
- Use compatibility mode in API responses and validators during rollback windows.
