$ErrorActionPreference = "Stop"

Write-Host "Starting Django backend with MySQL settings..."
& "..\DB_venv\Scripts\python.exe" ".\manage.py" "runserver"
