# API v2 Envelope Migration Proposal (March 13, 2026)

This proposal standardizes the entire API into a professional, predictable contract without breaking the existing frontend immediately.

## Target v2 Response Contract

### Success
```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "optional-request-id",
    "version": "v2"
  },
  "error": null
}
```

### Validation or Business Error
```json
{
  "success": false,
  "data": null,
  "meta": {
    "requestId": "optional-request-id",
    "version": "v2"
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": ["field-specific issue"]
  }
}
```

### Not Found
```json
{
  "success": false,
  "data": null,
  "meta": {
    "requestId": "optional-request-id",
    "version": "v2"
  },
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

## v2 Shape Rules

### Rule 1. Everything goes inside data
- Resource fetch: `data` is the resource object.
- Resource list: `data.items` is the array.
- Delete or side-effect action: `data` contains a result object, not message-only top level.
- Auth: `data` contains `{ token, user }`.

### Rule 2. meta is always reserved for transport-level metadata
Suggested meta fields:
- requestId
- version
- pagination
- filters
- count

### Rule 3. error is always structured
Suggested codes:
- VALIDATION_ERROR
- UNAUTHORIZED
- FORBIDDEN
- NOT_FOUND
- CONFLICT
- BUSINESS_RULE_VIOLATION
- INTERNAL_ERROR

### Rule 4. v2 uses camelCase at the API boundary
Even if Sequelize models remain snake_case internally, v2 responses should convert outward-facing fields to camelCase.

### Rule 5. Lists always use `data.items`
Optional list metadata goes in `meta`.

## Recommended v2 Shapes By Endpoint Type

### Resource list
```json
{
  "success": true,
  "data": {
    "items": []
  },
  "meta": {
    "count": 0,
    "version": "v2"
  },
  "error": null
}
```

### Resource detail
```json
{
  "success": true,
  "data": {
    "item": {}
  },
  "meta": {
    "version": "v2"
  },
  "error": null
}
```

### Create/update
```json
{
  "success": true,
  "data": {
    "item": {}
  },
  "meta": {
    "version": "v2"
  },
  "error": null
}
```

### Delete
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": 123
  },
  "meta": {
    "version": "v2"
  },
  "error": null
}
```

### Dashboard/report summary
```json
{
  "success": true,
  "data": {
    "summary": {}
  },
  "meta": {
    "filters": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-13"
    },
    "version": "v2"
  },
  "error": null
}
```

## Concrete Mapping Examples

### Current v1
`GET /api/students`
```json
[
  { "id": 1, "first_name": "Jane" }
]
```

### Proposed v2
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "firstName": "Jane" }
    ]
  },
  "meta": {
    "count": 1,
    "version": "v2"
  },
  "error": null
}
```

### Current v1
`PATCH /api/notifications/:id/read`
```json
{ "message": "Marked as read" }
```

### Proposed v2
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 17,
      "isRead": true
    }
  },
  "meta": {
    "version": "v2"
  },
  "error": null
}
```

### Current v1
`GET /api/reports/overview`
```json
{
  "reportRange": { "startDate": "2026-03-01", "endDate": "2026-03-13" },
  "stats": {}
}
```

### Proposed v2
```json
{
  "success": true,
  "data": {
    "summary": {
      "reportRange": { "startDate": "2026-03-01", "endDate": "2026-03-13" },
      "stats": {}
    }
  },
  "meta": {
    "version": "v2",
    "filters": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-13",
      "course": "overall"
    }
  },
  "error": null
}
```

## Safe Migration Strategy

### Phase 1. Introduce non-breaking response helpers
Add shared helpers such as:
- `sendOk(res, data, meta)`
- `sendCreated(res, data, meta)`
- `sendDeleted(res, id)`
- `sendList(res, items, meta)`
- `sendError(res, code, message, details, status)`

Do not switch existing endpoints yet.

### Phase 2. Add v2 routing or version negotiation
Choose one:
1. `/api/v2/...`
2. `Accept: application/vnd.guts.v2+json`

Recommendation: `/api/v2/...` is simpler and easier to test in this codebase.

### Phase 3. Add frontend unwrapping helpers
Current frontend code expects raw payloads directly in:
- [frontend/src/services/api.js](frontend/src/services/api.js)
- [frontend/src/services/resources.js](frontend/src/services/resources.js)
- [frontend/src/features/dashboard/services/dashboardApi.js](frontend/src/features/dashboard/services/dashboardApi.js)
- [frontend/src/features/auth/services/authApi.js](frontend/src/features/auth/services/authApi.js)

Introduce a client helper like:
```js
function unwrapApiResponse(payload) {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return payload.data;
  }
  return payload;
}
```

This allows a compatibility window where the frontend can consume both v1 and v2.

### Phase 4. Migrate by endpoint family
Recommended order:
1. auth
2. generic CRUD resources
3. users and notifications
4. students and enrollments
5. schedules
6. dashboard and reports

### Phase 5. Normalize field naming at the serializer layer
Do not rename DB columns. Instead add API serializers that convert:
- `first_name` -> `firstName`
- `is_read` -> `isRead`
- `created_at` -> `createdAt`

### Phase 6. Deprecate v1 after frontend cutover
After frontend unwraps v2 successfully and probe coverage passes:
- freeze v1
- update documentation
- remove v1 only after a stable window

## Suggested v2 Professional Standard

### Lists
- `data.items`
- `meta.count`

### Details and mutations
- `data.item`

### Side-effect actions
- `data.result`

### Summaries and dashboards
- `data.summary`

### Errors
- `error.code`
- `error.message`
- `error.details`

## What should change first
1. Standardize generic CRUD list/detail/create/update/delete responses behind v2 helpers.
2. Standardize notifications and users because they are small and easy wins.
3. Standardize schedules create to match schedules day item shape.
4. Standardize dashboard logs and reports daily to use one list field naming convention.

## Biggest Current Risks for v2 Migration
1. Frontend currently assumes raw payloads and will break on direct envelope replacement.
2. Snake_case fields are used in several UI flows and need serializer planning.
3. Some endpoints return summary objects, some raw arrays, and some messages only, so migration should be incremental, not all-at-once.
