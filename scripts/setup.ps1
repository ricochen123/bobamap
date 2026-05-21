# BobaMap one-time setup (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "=== BobaMap Setup ===" -ForegroundColor Cyan

# Backend
Write-Host "`n[1/4] Python virtual environment..." -ForegroundColor Yellow
Push-Location "$Root\backend"
if (-not (Test-Path "venv")) { python -m venv venv }
& .\venv\Scripts\pip install -r requirements.txt -q

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created backend/.env — add YELP_API_KEY before running." -ForegroundColor Green
}

$env:USE_SQLITE = "true"
& .\venv\Scripts\python manage.py migrate --noinput
Pop-Location

# Frontend
Write-Host "`n[2/4] npm install..." -ForegroundColor Yellow
Push-Location "$Root\frontend"
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created frontend/.env — add VITE_MAPBOX_TOKEN." -ForegroundColor Green
}
npm install
Pop-Location

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env  → YELP_API_KEY, SECRET_KEY"
Write-Host "2. Edit frontend/.env → VITE_MAPBOX_TOKEN"
Write-Host "3. Terminal 1: cd backend; .\venv\Scripts\activate; python manage.py runserver"
Write-Host "4. Terminal 2: cd frontend; npm run dev"
Write-Host "5. Open http://localhost:5173"
