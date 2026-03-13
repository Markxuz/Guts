# API Contract Coverage (March 13, 2026)

## Standard Error Payload
All endpoints now return a consistent error shape:

```json
{
  "message": "Human-readable error message",
  "details": ["Optional validation details"]
}
```

Notes:
- details is included for Joi validation failures and omitted otherwise.
- status codes are endpoint-specific (400/401/403/404/500).

## Auth and Access Contract
- All /api/auth endpoints: public for login/register, token required for /me.
- All CRUD resources mounted in src/routes/index.js now require bearer auth.
- Users and notifications remain role-gated as before.

## Request Validation Coverage

### Auth
- POST /api/auth/login
  - required: email, password
- POST /api/auth/register
  - required: name, email, password
  - enum: role in admin | sub_admin | staff

### Users
- POST /api/users
  - required: name, email, password
  - enum: role in admin | sub_admin | staff
- PATCH /api/users/:id/role
  - required param: id (positive integer)
  - required body: role
  - enum: role in admin | sub_admin | staff
- DELETE /api/users/:id
  - required param: id (positive integer)

### Students
- POST /api/students
  - required: first_name, last_name
- PUT /api/students/:id
  - at least one editable field required
- PUT /api/students/:id/enrollment-status
  - required: enrollmentStatus
  - enum: pending | confirmed | completed

### Enrollments
- POST /api/enrollments
  - required: enrollment_type, student
  - enum: enrollment_type in TDC | PDC | PROMO
  - enum: status in pending | confirmed | completed
  - enum: pdc_type in beginner | experience
  - enum: pdc_category in Beginner | Experience
  - enum: target_vehicle in Car | Motor | Motorcycle
  - enum: transmission_type and motorcycle_type in Manual | Automatic
- PUT /api/enrollments/:id
  - at least one field required
  - enums enforced as above where applicable

### Schedules
- GET /api/schedules/day
  - required query: date (YYYY-MM-DD)
- GET /api/schedules/month-status
  - required query: year (2000..2100), month (1..12)
- POST /api/schedules
  - required: course_id, instructor_id, vehicle_id, schedule_date, slot
  - enum: slot in morning | afternoon

### Reports
- GET /api/reports/daily
  - required: date OR (startDate and endDate)
- GET /api/reports/overview
  - required: startDate, endDate
  - enum: course in overall | tdc | pdc | pdc_beginner | pdc_experience

### Dashboard and Activity Logs
- GET /api/dashboard/logs
  - required query: date (YYYY-MM-DD)
- GET /api/activity-logs
  - optional query: date (YYYY-MM-DD), limit (1..100)

### Notifications
- PATCH /api/notifications/:id/read
  - required param: id (positive integer)

### Generic CRUD Resources (Joi Enforced)
- /api/courses
  - create required: course_name
- /api/packages
  - create required: package_name
- /api/dl-codes
  - create required: code
- /api/instructors
  - create required: name, license_number, specialization, status
  - enum: specialization in PDC Certified | TDC Certified
  - enum: status in Active | On Leave
- /api/vehicles
  - create required: plate_number, vehicle_type
  - enum: vehicle_type in Sedan | Motorcycle | Car | Motor
- /api/maintenance-logs
  - create required: vehicle_id, service_type, date_of_service, next_schedule_date
- /api/fuel-logs
  - create required: vehicle_id, liters, amount_spent, odometer_reading
- /api/certificates
  - create required: certificate_number

## Success Payload Note
Success payloads are intentionally backward-compatible and remain resource-native (arrays/objects/messages) to avoid breaking frontend consumers. Error payloads are standardized across modules.
