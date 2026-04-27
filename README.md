# Guts - Quick Clone Setup

Use this guide when moving to a new laptop/desktop for demos and presentations.

## Production Server (Docker + Tailscale)

For a stable server install (no hot-reload bind mounts), use the production profile:

Windows PowerShell:

```powershell
.\scripts\deploy-prod.ps1
```

macOS/Linux:

```bash
chmod +x ./scripts/deploy-prod.sh
./scripts/deploy-prod.sh
```

This starts containers using `docker-compose.prod.yml`.

Production env checklist:

- `docs/production-env-checklist.md`
- `.env.production.template`

After first successful startup on a fresh database:

1. Set `DB_BOOTSTRAP_SYNC=false` in root `.env`
2. Set `SEED_DEFAULT_USERS=false` in root `.env`
3. Re-run deploy command above

Detailed guide: `backend/docs/docker-tailscale-deploy.md`

Post-deploy verification:

Windows PowerShell:

```powershell
.\scripts\verify-prod.ps1
```

Linux/macOS:

```bash
./scripts/verify-prod.sh
```

## 1) Fast Setup (Windows)

Run from repository root:

```powershell
.\scripts\bootstrap.ps1
```

What it does:
- Creates missing env files from templates.
- Forces local-safe defaults for development (`DB_SYNC=false`, `NODE_ENV=development`).
- Enables one-time seeded users locally (`SEED_DEFAULT_USERS=true`).
- Installs backend + frontend dependencies.
- Runs backend migrations.

Then start services in two terminals:

```powershell
cd backend
npm start
```

```powershell
cd frontend
npm run dev
```

Open: `http://localhost:5173`

## 2) Fast Setup (Docker)

Run from repository root:

```powershell
.\scripts\bootstrap.ps1 -Mode docker
```

Open: `http://localhost:8080`

Note: this mode is for development convenience. For server deployment, use the Production Server section above.

## 3) macOS/Linux

```bash
chmod +x ./scripts/bootstrap.sh
./scripts/bootstrap.sh
```

Docker mode:

```bash
./scripts/bootstrap.sh --mode docker
```

## 4) Common Flags

PowerShell:

```powershell
.\scripts\bootstrap.ps1 -SkipInstall
.\scripts\bootstrap.ps1 -SkipMigrate
```

Bash:

```bash
./scripts/bootstrap.sh --skip-install
./scripts/bootstrap.sh --skip-migrate
```

## 5) Why this fixes clone issues

- Env files are created automatically from tracked templates.
- Frontend API proxy target is now environment-driven for local and Docker.
- Install + migration steps are run in consistent order.
- Startup instructions are standardized for every machine.

## 6) Quick Recovery (When Demo Login Shows 500)

If your browser shows random `500` errors (usually stale Docker frontend proxy state), run:

Windows PowerShell:

```powershell
.\scripts\restart-stack.ps1
```

macOS/Linux:

```bash
chmod +x ./scripts/restart-stack.sh
./scripts/restart-stack.sh
```

Fast restart only (no rebuild):

PowerShell:

```powershell
.\scripts\restart-stack.ps1 -NoBuild
```

Bash:

```bash
./scripts/restart-stack.sh --no-build
```
