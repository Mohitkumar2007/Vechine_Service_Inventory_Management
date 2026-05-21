@echo off
setlocal
cd /d "%~dp0"

echo Vehicle Service Inventory Management System - Windows Setup
echo.

set "MYSQL_HOST=15.134.39.121"
set "MYSQL_PORT=3306"
set "MYSQL_DATABASE=vehicle_service_db"
set "MYSQL_USER=mohit"
set "MYSQL_SSL=false"

set /p MYSQL_HOST_INPUT=MySQL host [15.134.39.121]: 
if not "%MYSQL_HOST_INPUT%"=="" set "MYSQL_HOST=%MYSQL_HOST_INPUT%"

set /p MYSQL_PORT_INPUT=MySQL port [3306]: 
if not "%MYSQL_PORT_INPUT%"=="" set "MYSQL_PORT=%MYSQL_PORT_INPUT%"

set /p MYSQL_DATABASE_INPUT=MySQL database [vehicle_service_db]: 
if not "%MYSQL_DATABASE_INPUT%"=="" set "MYSQL_DATABASE=%MYSQL_DATABASE_INPUT%"

set /p MYSQL_USER_INPUT=MySQL username [mohit]: 
if not "%MYSQL_USER_INPUT%"=="" set "MYSQL_USER=%MYSQL_USER_INPUT%"

set /p MYSQL_PASSWORD=MySQL password: 

set /p MYSQL_SSL_INPUT=Use SSL for hosted MySQL? [Y/N, default N]: 
if /I "%MYSQL_SSL_INPUT%"=="Y" set "MYSQL_SSL=true"

echo.
echo Creating Python virtual environment if needed...
if not exist "DB_venv\Scripts\python.exe" (
  py -3 -m venv DB_venv
  if errorlevel 1 python -m venv DB_venv
  if errorlevel 1 (
    echo ERROR: Could not create Python virtual environment.
    exit /b 1
  )
)

echo Installing backend dependencies...
"DB_venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
if errorlevel 1 (
  echo ERROR: Backend dependency installation failed.
  exit /b 1
)

echo Writing local .env file...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$lines = @('DJANGO_SECRET_KEY=dbms-project-dev-key', 'DJANGO_DEBUG=true', 'MYSQL_DATABASE=' + $env:MYSQL_DATABASE, 'MYSQL_USER=' + $env:MYSQL_USER, 'MYSQL_PASSWORD=' + $env:MYSQL_PASSWORD, 'MYSQL_HOST=' + $env:MYSQL_HOST, 'MYSQL_PORT=' + $env:MYSQL_PORT, 'MYSQL_SSL=' + $env:MYSQL_SSL, 'MySQL_database=' + $env:MYSQL_DATABASE, 'MySQL_user=' + $env:MYSQL_USER, 'MySQL_password=' + $env:MYSQL_PASSWORD, 'MySQL_host=' + $env:MYSQL_HOST, 'MySQL_port=' + $env:MYSQL_PORT); Set-Content -Path '.env' -Value $lines -Encoding UTF8"
if errorlevel 1 (
  echo ERROR: Could not write .env file.
  exit /b 1
)

echo Testing MySQL connection and preparing schema...
set "MYSQL_SSL_ARG="
if /I "%MYSQL_SSL%"=="true" set "MYSQL_SSL_ARG=--ssl"
"DB_venv\Scripts\python.exe" scripts\mysql_setup.py --host "%MYSQL_HOST%" --port "%MYSQL_PORT%" --user "%MYSQL_USER%" --password "%MYSQL_PASSWORD%" --database "%MYSQL_DATABASE%" %MYSQL_SSL_ARG%
if errorlevel 1 (
  echo.
  echo ERROR: Setup stopped because MySQL connection/schema setup failed.
  echo Check that MySQL is running and the username/password are correct.
  exit /b 1
)

echo Installing frontend dependencies...
pushd frontend
npm install --include=optional
if errorlevel 1 (
  popd
  echo ERROR: Frontend dependency installation failed.
  exit /b 1
)
popd

echo.
echo Setup completed successfully.
set /p START_NOW=Start backend and frontend now? [Y/N]: 
if /I "%START_NOW%"=="Y" call "%~dp0run_windows.bat"

endlocal
