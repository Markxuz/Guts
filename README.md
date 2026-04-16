# Guts - Quick Clone Setup

Use this guide when moving to a new laptop/desktop for demos and presentations.

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
