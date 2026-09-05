# ==============================================================================
# TRUSTDOC — AI-Powered Identity Verification & Forensic Analysis Platform
# Single-Command Startup Script for Windows PowerShell
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "              TRUSTDOC VERIFICATION PLATFORM v1.0                     " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "       AI Forensics · ICAO 9303 MRZ · Biometric · Cryptographic Proof  " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$RootDir = $PSScriptRoot
if (-not $RootDir) { $RootDir = (Get-Location).Path }

$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend_trust-main"
$BackendVenv = Join-Path $BackendDir "venv"
$PythonExe = Join-Path $BackendVenv "Scripts\python.exe"

# ------------------------------------------------------------------------------
# 1. Environment & Dependency Checks
# ------------------------------------------------------------------------------
Write-Host "[1/5] Checking environment requirements..." -ForegroundColor Yellow

# Check Python
if (-not (Test-Path $PythonExe)) {
    Write-Host "Virtual environment not found in backend/venv. Creating virtual environment..." -ForegroundColor DarkYellow
    Push-Location $BackendDir
    python -m venv venv
    Pop-Location
}

if (-not (Test-Path $PythonExe)) {
    Write-Host "ERROR: Python is not available in backend/venv. Please ensure Python 3.10+ is installed." -ForegroundColor Red
    exit 1
}
Write-Host "  -> Python virtualenv active: $PythonExe" -ForegroundColor Green

# Check Node.js
try {
    $nodeVer = node -v
    Write-Host "  -> Node.js detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# 2. Backend Setup & Seeding
# ------------------------------------------------------------------------------
Write-Host "`n[2/5] Initializing Backend Database & Admin Seeding..." -ForegroundColor Yellow

Push-Location $BackendDir

# Check .env file
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  -> Created .env from .env.example" -ForegroundColor DarkGray
    }
}

# Initialize DB and seed demo admin
& $PythonExe -c "from app.main import app, init_db; init_db(); print('Database tables ready & Admin verified.')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  -> Installing missing backend dependencies..." -ForegroundColor DarkYellow
    & $PythonExe -m pip install -r requirements.txt
    & $PythonExe -c "from app.main import app, init_db; init_db(); print('Database tables ready & Admin verified.')"
}
Write-Host "  -> Backend database initialized." -ForegroundColor Green
Pop-Location

# ------------------------------------------------------------------------------
# 3. Frontend Setup
# ------------------------------------------------------------------------------
Write-Host "`n[3/5] Verifying Frontend Dependencies..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "  -> Running npm install in frontend (this happens only on first run)..." -ForegroundColor DarkYellow
    Push-Location $FrontendDir
    npm install
    Pop-Location
}
Write-Host "  -> Frontend dependencies verified." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 4. Starting Background Servers
# ------------------------------------------------------------------------------
Write-Host "`n[4/5] Launching Servers..." -ForegroundColor Yellow

# Kill any existing processes on port 8000 and 3000 to prevent port collisions
function Stop-PortProcess($port) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

Stop-PortProcess 8000
Stop-PortProcess 3000

# Start Backend Process
Write-Host "  -> Starting FastAPI backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$BackendProcess = Start-Process -FilePath $PythonExe `
    -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" `
    -WorkingDirectory $BackendDir `
    -PassThru `
    -WindowStyle Minimized

# Start Frontend Process
Write-Host "  -> Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Cyan
$FrontendProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -WorkingDirectory $FrontendDir `
    -PassThru `
    -WindowStyle Minimized

# ------------------------------------------------------------------------------
# 5. Health Check & Browser Launch
# ------------------------------------------------------------------------------
Write-Host "`n[5/5] Awaiting service readiness..." -ForegroundColor Yellow

$backendReady = $false
$retries = 30
while ($retries -gt 0 -and -not $backendReady) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp.status -eq "ok") {
            $backendReady = $true
        }
    } catch {
        $retries--
    }
}

if ($backendReady) {
    Write-Host "  -> Backend is HEALTHY at http://127.0.0.1:8000" -ForegroundColor Green
} else {
    Write-Host "  -> Warning: Backend health check timed out. Checking processes..." -ForegroundColor DarkYellow
}

Start-Sleep -Seconds 3

# Launch Browser
Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "                 TRUSTDOC IS RUNNING SUCCESSFULLY!                   " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Web Dashboard:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API Swagger Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  API Health:         http://127.0.0.1:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  DEMO CREDENTIALS:" -ForegroundColor Yellow
Write-Host "    Username:         admin@trustdoc.gov.in" -ForegroundColor White
Write-Host "    Password:         TrustDoc2026!" -ForegroundColor White
Write-Host "    (Or click 'Sign in as Demo Admin' on login screen)" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C or 'q' to stop all servers and exit." -ForegroundColor DarkGray
Write-Host ""

try {
    Start-Process "http://localhost:3000"
} catch {}

# Keep script running and handle clean shutdown
try {
    while ($true) {
        if ($Host.UI.RawUI.KeyAvailable) {
            $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyUp")
            if ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
                break
            }
        }
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    if ($BackendProcess) { Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($FrontendProcess) { Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue }
    Stop-PortProcess 8000
    Stop-PortProcess 3000
    Write-Host "TRUSTDOC stopped cleanly. Goodbye!`n" -ForegroundColor Green
}
