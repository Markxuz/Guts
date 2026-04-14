# Remarks Flow Regression Checklist

## Scope

Validate that schedule remarks are saved and consistently reflected across:

1. Dashboard Calendar Schedule modal
2. Students table (Student Database)
3. Student Profile modal (View)

## Preconditions

1. App is running and admin login works.
2. At least one student has a schedule on a known date.
3. Recommended test date example: `2026-04-22`.

## Test Steps

1. Open Dashboard (`/`).
2. In Calendar, double-click a date with schedules.
3. In Calendar Schedule modal:
   - Enter `Instructor Remarks`: `REGRESSION: instructor remarks`
   - Enter `Student Remarks`: `REGRESSION: student remarks`
   - Click `Save Remarks` for both.
4. Close modal and go to Students (`/students`).
5. Search by test student email.
6. Verify table columns:
   - Instructor Remarks shows `REGRESSION: instructor remarks`
   - Student Remarks shows `REGRESSION: student remarks`
7. Click `View` for the same student.
8. Verify in Student Profile modal:
   - Instructor Remarks shows `REGRESSION: instructor remarks`
   - Student Remarks shows `REGRESSION: student remarks`

## Pass Criteria

1. No `Validation error` toast/banner during save.
2. Remarks values persist after page reload.
3. Students table and Student Profile modal match Calendar-entered values.

## Quick Failure Triage

1. If save fails with validation:
   - Confirm payload includes top-level `remarks` in `PATCH /api/schedules/:id/remarks`.
2. If Students shows `-` but Dashboard has values:
   - Confirm students endpoint includes latest schedule fallback (`Enrollment.Schedule` then `Enrollment.scheduledSessions[0]`).
3. If details modal differs from table:
   - Confirm both use same latest-schedule fallback helper.
