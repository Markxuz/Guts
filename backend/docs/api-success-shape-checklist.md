# API Success Shape Checklist (March 13, 2026)

This checklist captures the current top-level success payload shape for each endpoint family and flags where the shape is inconsistent with the rest of the system.

## Current Error Contract
All audited endpoints now use the standardized error payload:

```json
{
  "message": "Human-readable error message",
  "details": ["Optional validation details"]
}
```

## Strict Endpoint Checklist

| Endpoint | Auth | Validation | Current Success Shape | Shape Status | Notes |
|---|---|---|---|---|---|
| POST /api/auth/login | Public | Joi body | `{ token, user }` | Mixed | No `data` envelope; auth-specific shape |
| POST /api/auth/register | Public | Joi body | `{ token, user }` | Mixed | Same as login |
| GET /api/auth/me | Bearer | Token only | `{ user }` | Mixed | Wrapped object, but different from login/register |
| GET /api/users | Admin | None | `User[]` | Inconsistent | Raw array list |
| POST /api/users | Admin | Joi body | `User` | Inconsistent | Raw object create response |
| PATCH /api/users/:id/role | Admin | Joi params + body | `User` | Inconsistent | Raw object mutation response |
| DELETE /api/users/:id | Admin | Joi params | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/students | Bearer | None | `Student[]` | Inconsistent | Raw array list; snake_case fields |
| GET /api/students/:id | Bearer | None | `Student` | Inconsistent | Raw object; snake_case with nested models |
| POST /api/students | Bearer | Joi body | `Student` | Inconsistent | Raw object |
| PUT /api/students/:id | Bearer | Joi body | `Student` | Inconsistent | Raw object |
| PUT /api/students/:id/enrollment-status | Bearer | Joi body | `Student` | Inconsistent | Returns full student, not enrollment-status resource |
| DELETE /api/students/:id | Admin | None | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/enrollments | Bearer | None | `Enrollment[]` | Inconsistent | Raw array list; snake_case fields |
| GET /api/enrollments/:id | Bearer | None | `Enrollment` | Inconsistent | Raw object |
| POST /api/enrollments | Bearer | Joi body | `Enrollment` | Inconsistent | Raw object |
| PUT /api/enrollments/:id | Bearer | Joi body | `Enrollment` | Inconsistent | Raw object |
| DELETE /api/enrollments/:id | Bearer | None | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/schedules/day | Bearer | Joi query | `{ date, slots, dayFull, items }` | Mixed | Structured object with mapped camelCase items |
| GET /api/schedules/month-status | Bearer | Joi query | `{ items }` | Inconsistent | Wrapper object differs from day and create |
| POST /api/schedules | Bearer | Joi body | `Schedule` | Inconsistent | Returns raw schedule row, not mapped day item shape |
| GET /api/dashboard/summary | Bearer | None | `{ stats, monthlyEnrollment, activityDates }` | Mixed | Summary object, acceptable but no standard envelope |
| GET /api/dashboard/logs | Bearer | Joi query | `{ date, total, dailyReports, recentActivities }` | Inconsistent | Uses `dailyReports`, while other list endpoints use `items` |
| GET /api/reports/daily | Bearer | Joi query | `{ date, startDate, endDate, isRange, total, availability, dayFull, items }` | Mixed | Strong report payload, but custom envelope |
| GET /api/reports/overview | Bearer | Joi query | `{ reportRange, stats, monthlyEnrollment, activityDates, dailyTransactions, recentActivities, maintenanceSummary, fuelSummary, usageByVehicle }` | Mixed | Large custom summary object |
| GET /api/activity-logs | Bearer | Joi query | `{ date, items }` | Mixed | Wrapper object with items |
| GET /api/notifications | Admin/Sub Admin | None | `{ items, unreadCount }` | Mixed | List wrapper with counter |
| PATCH /api/notifications/read-all | Admin/Sub Admin | None | `{ message }` | Inconsistent | Message-only mutation response |
| PATCH /api/notifications/:id/read | Admin/Sub Admin | Joi params | `{ message }` | Inconsistent | Message-only mutation response |
| GET /api/courses | Bearer | CRUD Joi | `Course[]` | Inconsistent | Raw array list |
| POST /api/courses | Bearer | CRUD Joi | `Course` | Inconsistent | Raw object |
| PUT /api/courses/:id | Bearer | CRUD Joi | `Course` | Inconsistent | Raw object |
| DELETE /api/courses/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/packages | Bearer | CRUD Joi | `Package[]` | Inconsistent | Raw array list |
| POST /api/packages | Bearer | CRUD Joi | `Package` | Inconsistent | Raw object |
| PUT /api/packages/:id | Bearer | CRUD Joi | `Package` | Inconsistent | Raw object |
| DELETE /api/packages/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/dl-codes | Bearer | CRUD Joi | `DLCode[]` | Inconsistent | Raw array list |
| POST /api/dl-codes | Bearer | CRUD Joi | `DLCode` | Inconsistent | Raw object |
| PUT /api/dl-codes/:id | Bearer | CRUD Joi | `DLCode` | Inconsistent | Raw object |
| DELETE /api/dl-codes/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/instructors | Bearer | CRUD Joi | `Instructor[]` | Inconsistent | Raw array list with snake_case plus include |
| POST /api/instructors | Bearer | CRUD Joi | `Instructor` | Inconsistent | Raw object |
| PUT /api/instructors/:id | Bearer | CRUD Joi | `Instructor` | Inconsistent | Raw object |
| DELETE /api/instructors/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/vehicles | Bearer | CRUD Joi | `Vehicle[]` | Inconsistent | Raw array list |
| POST /api/vehicles | Bearer | CRUD Joi | `Vehicle` | Inconsistent | Raw object |
| PUT /api/vehicles/:id | Bearer | CRUD Joi | `Vehicle` | Inconsistent | Raw object |
| DELETE /api/vehicles/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/maintenance-logs | Bearer | CRUD Joi | `MaintenanceLog[]` | Inconsistent | Raw array list |
| POST /api/maintenance-logs | Bearer | CRUD Joi | `MaintenanceLog` | Inconsistent | Raw object |
| PUT /api/maintenance-logs/:id | Bearer | CRUD Joi | `MaintenanceLog` | Inconsistent | Raw object |
| DELETE /api/maintenance-logs/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/fuel-logs | Bearer | CRUD Joi | `FuelLog[]` | Inconsistent | Raw array list |
| POST /api/fuel-logs | Bearer | CRUD Joi | `FuelLog` | Inconsistent | Raw object |
| PUT /api/fuel-logs/:id | Bearer | CRUD Joi | `FuelLog` | Inconsistent | Raw object |
| DELETE /api/fuel-logs/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |
| GET /api/certificates | Bearer | CRUD Joi | `Certificate[]` | Inconsistent | Raw array list |
| POST /api/certificates | Bearer | CRUD Joi | `Certificate` | Inconsistent | Raw object |
| PUT /api/certificates/:id | Bearer | CRUD Joi | `Certificate` | Inconsistent | Raw object |
| DELETE /api/certificates/:id | Bearer | Joi id | `{ message }` | Inconsistent | Message-only delete response |

## Shape Inconsistencies Flagged

### 1. List shape inconsistency
Current list endpoints use at least four different patterns:
- raw arrays: users, students, enrollments, generic CRUD lists
- `{ items }`: schedule month-status
- `{ date, items }`: activity logs
- `{ items, unreadCount }`: notifications

### 2. Mutation shape inconsistency
Current mutations use at least three patterns:
- raw created/updated resource object
- `{ message }` for deletes and notification actions
- auth-specific payload `{ token, user }`

### 3. Naming convention inconsistency
Field naming is mixed between snake_case and camelCase:
- raw model payloads are mostly snake_case
- schedules day/report payloads are camelCase
- notifications use snake_case fields like `is_read`, `actor_id`
- dashboard and reports use camelCase summary fields

### 4. Resource shape inconsistency within the same module
- schedules day returns mapped schedule items in camelCase, but schedules create returns a raw schedule model object
- dashboard logs returns `dailyReports`, while reports daily returns `items`
- students enrollment-status update returns a full student resource instead of a minimal status-update result

### 5. Envelope inconsistency
There is no global success envelope. Each endpoint decides independently whether to return:
- bare data
- object wrapper
- message-only response
- auth payload

## Highest-Priority Professionalization Targets
1. Standardize all list endpoints to one shape.
2. Standardize all mutation responses to one shape.
3. Normalize field naming for v2 to camelCase at the API boundary.
4. Introduce a single success envelope so frontend clients can handle all endpoints uniformly.
