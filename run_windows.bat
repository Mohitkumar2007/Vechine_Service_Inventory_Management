@echo off
cd /d "%~dp0"
set "ROOT=%~dp0"

if not exist "DB_venv\Scripts\python.exe" (
  echo ERROR: DB_venv was not found. Run setup_windows.bat first.
  exit /b 1
)

if not exist ".env" (
  echo ERROR: .env was not found. Run setup_windows.bat first.
  exit /b 1
)

echo Starting Django backend on http://127.0.0.1:8000
start "Vehicle Service Backend" cmd /k "cd /d ""%ROOT%backend"" && ..\DB_venv\Scripts\python.exe manage.py runserver 8000"

echo Starting React frontend on http://localhost:3000
start "Vehicle Service Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo.
echo Servers are starting in separate windows.
