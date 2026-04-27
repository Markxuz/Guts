# Render Beta Deploy Checklist

This document is the companion checklist for [render.yaml](../render.yaml).

## 1) Create Services from Blueprint

1. Push the branch that contains `render.yaml`.
2. In Render, choose **New +** -> **Blueprint**.
3. Select the repository and branch.
4. Confirm these services are created:
- `db` (Private Service)
- `backend` (Web Service)
- `frontend` (Web Service)

## 2) Required Variables Before First Deploy

Set these values in Render dashboard before starting deployment:

- `db` service:
- `MYSQL_ROOT_PASSWORD` (strong secret)
- `DB_PASSWORD` (same strong password used by backend)
- `MYSQL_PASSWORD` (same as `DB_PASSWORD`)

- `backend` service:
- `DB_PASSWORD` (must match db service user password)
- `SEED_ADMIN_PASSWORD` (temporary strong password)
- `SEED_STAFF_PASSWORD` (temporary strong password)
- `CORS_ALLOWED_ORIGINS` (exact frontend Render URL, for example `https://frontend.onrender.com`)

Optional backend variables:
- `BACKUP_ALERT_WEBHOOK_URL`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`

## 3) First-Run Safety Values

For first deployment on a fresh DB:

- `DB_BOOTSTRAP_SYNC=true`
- `SEED_DEFAULT_USERS=true`

After first successful login/provisioning, update and redeploy backend:

- `DB_BOOTSTRAP_SYNC=false`
- `SEED_DEFAULT_USERS=false`

## 4) Health Checks

Backend health endpoints:

- `GET /api/health`
- `GET /api/health/ready`

Expected:
- `/api/health` -> `status: ok`
- `/api/health/ready` -> `status: ready`

## 5) Notes About Frontend -> Backend Routing

The frontend container expects backend internal hostname `backend` for `/api` proxying.
Keep the backend Render service name as `backend`.

## 6) Quick Troubleshooting

- If login returns CORS error, verify `CORS_ALLOWED_ORIGINS` exactly matches frontend URL.
- If backend cannot connect to MySQL, re-check `DB_PASSWORD` consistency between `db` and `backend` services.
- If first startup fails on schema or seed assumptions, keep `DB_BOOTSTRAP_SYNC=true` for first clean run, then switch to `false` after successful provisioning.
