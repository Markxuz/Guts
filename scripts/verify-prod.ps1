param(
  [switch]$RunManualBackup,
  [switch]$SkipAuthChecks,
  [string]$LoginEmail,
  [string]$LoginPassword
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$message) {
  Write-Host "[verify-prod] $message" -ForegroundColor Cyan
}

function Get-EnvValue([string]$filePath, [string]$key, [string]$fallback = "") {
  if (-not (Test-Path $filePath)) {
    return $fallback
  }

  $line = Get-Content $filePath | Where-Object { $_ -match "^\s*$key=" } | Select-Object -First 1
  if (-not $line) {
    return $fallback
  }

  return ($line -split "=", 2)[1].Trim()
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".env"

$appPort = Get-EnvValue $envFile "APP_PORT" "8080"
$adminEmail = if ([string]::IsNullOrWhiteSpace($LoginEmail)) {
  (Get-EnvValue $envFile "VERIFY_LOGIN_EMAIL" (Get-EnvValue $envFile "SEED_ADMIN_EMAIL" "admin@guts.local"))
} else {
  $LoginEmail
}
$adminPassword = if ([string]::IsNullOrWhiteSpace($LoginPassword)) {
  (Get-EnvValue $envFile "VERIFY_LOGIN_PASSWORD" (Get-EnvValue $envFile "SEED_ADMIN_PASSWORD" ""))
} else {
  $LoginPassword
}

$baseUrl = "http://localhost:$appPort"
Write-Step "Base URL: $baseUrl"

Write-Step "Checking /api/health"
$health = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/health"
if ($health.status -ne "ok") {
  throw "Health check returned unexpected status: $($health.status)"
}

Write-Step "Checking /api/health/ready"
$ready = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/health/ready"
if ($ready.status -ne "ready") {
  throw "Readiness check returned unexpected status: $($ready.status)"
}

if ($SkipAuthChecks) {
  Write-Step "Skipping auth-dependent checks by request."
  Write-Step "All production verification checks passed."
  exit 0
}

if ([string]::IsNullOrWhiteSpace($adminPassword)) {
  throw "Login password missing. Set VERIFY_LOGIN_PASSWORD in .env or pass -LoginPassword."
}

Write-Step "Checking login endpoint with seed admin"
$loginBody = @{
  email = $adminEmail
  password = $adminPassword
} | ConvertTo-Json

$login = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -ContentType "application/json" -Body $loginBody
if (-not $login.token) {
  throw "Login response did not include token."
}

$headers = @{ Authorization = "Bearer $($login.token)" }

Write-Step "Checking authenticated profile endpoint"
$me = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/auth/me" -Headers $headers
if (-not $me.user) {
  throw "Profile endpoint did not return user payload."
}

Write-Step "Checking backup status endpoint"
$backupStatus = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/backups/status" -Headers $headers
if (-not ($backupStatus.PSObject.Properties.Name -contains "status")) {
  throw "Backup status response missing 'status' field."
}

if ($RunManualBackup) {
  Write-Step "Triggering manual backup endpoint"
  $manual = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/backups/run" -Headers $headers -ContentType "application/json" -Body "{}"
  if ($manual.status -ne "success") {
    throw "Manual backup did not return success status."
  }
}

Write-Step "All production verification checks passed."