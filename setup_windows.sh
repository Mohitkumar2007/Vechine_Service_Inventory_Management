#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "Vehicle Service Inventory Management System - Windows Git Bash Setup"
echo

if [[ "$OSTYPE" == linux* ]]; then
  echo "Linux/Azure environment detected."
else
  echo "Windows Git Bash environment detected."
fi

read -r -p "MySQL host [15.134.39.121]: " MYSQL_HOST
MYSQL_HOST="${MYSQL_HOST:-15.134.39.121}"

read -r -p "MySQL port [3306]: " MYSQL_PORT
MYSQL_PORT="${MYSQL_PORT:-3306}"

read -r -p "MySQL database [vehicle_service_db]: " MYSQL_DATABASE
MYSQL_DATABASE="${MYSQL_DATABASE:-vehicle_service_db}"

read -r -p "MySQL username [mohit]: " MYSQL_USER
MYSQL_USER="${MYSQL_USER:-mohit}"

read -r -s -p "MySQL password: " MYSQL_PASSWORD
echo

read -r -p "Use SSL for hosted MySQL? [Y/N, default N]: " MYSQL_SSL_INPUT
MYSQL_SSL=false
if [[ "$MYSQL_SSL_INPUT" =~ ^[Yy]$ ]]; then
  MYSQL_SSL=true
fi

echo "Creating Python virtual environment if needed..."
if [[ -x "DB_venv/Scripts/python.exe" ]]; then
  VENV_PYTHON="DB_venv/Scripts/python.exe"
elif [[ -x "DB_venv/bin/python" ]]; then
  VENV_PYTHON="DB_venv/bin/python"
else
  if command -v python3 >/dev/null 2>&1; then
    python3 -m venv DB_venv
  elif command -v py >/dev/null 2>&1; then
    py -3 -m venv DB_venv
  elif command -v python >/dev/null 2>&1; then
    python -m venv DB_venv
  else
    echo "ERROR: Python was not found. Install python3 and python3-venv, then rerun this script." >&2
    echo "Ubuntu/Debian: sudo apt update && sudo apt install -y python3 python3-venv python3-pip nodejs npm" >&2
    exit 1
  fi

  if [[ -x "DB_venv/Scripts/python.exe" ]]; then
    VENV_PYTHON="DB_venv/Scripts/python.exe"
  elif [[ -x "DB_venv/bin/python" ]]; then
    VENV_PYTHON="DB_venv/bin/python"
  else
    echo "ERROR: Virtual environment was created, but Python executable was not found inside DB_venv." >&2
    exit 1
  fi
fi

echo "Installing backend dependencies..."
"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install -r backend/requirements.txt

echo "Writing local .env file..."
cat > .env <<EOF
DJANGO_SECRET_KEY=dbms-project-dev-key
DJANGO_DEBUG=true
MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_HOST=$MYSQL_HOST
MYSQL_PORT=$MYSQL_PORT
MYSQL_SSL=$MYSQL_SSL
MySQL_database=$MYSQL_DATABASE
MySQL_user=$MYSQL_USER
MySQL_password=$MYSQL_PASSWORD
MySQL_host=$MYSQL_HOST
MySQL_port=$MYSQL_PORT
EOF

echo "Testing MySQL connection and preparing schema..."
MYSQL_SSL_ARGS=()
if [[ "$MYSQL_SSL" == "true" ]]; then
  MYSQL_SSL_ARGS+=(--ssl)
fi

if ! "$VENV_PYTHON" scripts/mysql_setup.py \
  --host "$MYSQL_HOST" \
  --port "$MYSQL_PORT" \
  --user "$MYSQL_USER" \
  --password "$MYSQL_PASSWORD" \
  --database "$MYSQL_DATABASE" \
  "${MYSQL_SSL_ARGS[@]}"; then
  echo
  echo "ERROR: Setup stopped because MySQL connection/schema setup failed." >&2
  echo "Check that MySQL is running and the username/password are correct." >&2
  exit 1
fi

echo "Installing frontend dependencies..."
(
  cd frontend
  npm install --include=optional
  if [[ "$OSTYPE" == linux* ]]; then
    if ! node -e "require('@tailwindcss/oxide')" >/dev/null 2>&1; then
      echo "Tailwind native binding is missing. Reinstalling frontend dependencies for Linux..."
      rm -rf node_modules package-lock.json
      npm install --include=optional
    fi
  fi
)

echo
echo "Setup completed successfully."
read -r -p "Start backend and frontend now? [Y/N]: " START_NOW
if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
  "$ROOT_DIR/run_windows.sh"
fi
