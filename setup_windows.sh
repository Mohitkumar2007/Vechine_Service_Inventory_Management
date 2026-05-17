#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "Vehicle Service Inventory Management System - Windows Git Bash Setup"
echo

read -r -p "MySQL host [localhost]: " MYSQL_HOST
MYSQL_HOST="${MYSQL_HOST:-localhost}"

read -r -p "MySQL port [3306]: " MYSQL_PORT
MYSQL_PORT="${MYSQL_PORT:-3306}"

read -r -p "MySQL database [vehicle_service_db]: " MYSQL_DATABASE
MYSQL_DATABASE="${MYSQL_DATABASE:-vehicle_service_db}"

read -r -p "MySQL username [root]: " MYSQL_USER
MYSQL_USER="${MYSQL_USER:-root}"

read -r -s -p "MySQL password: " MYSQL_PASSWORD
echo

echo "Creating Python virtual environment if needed..."
if [[ ! -x "DB_venv/Scripts/python.exe" ]]; then
  if command -v py >/dev/null 2>&1; then
    py -3 -m venv DB_venv
  else
    python -m venv DB_venv
  fi
fi

echo "Installing backend dependencies..."
"DB_venv/Scripts/python.exe" -m pip install -r backend/requirements.txt

echo "Writing local .env file..."
cat > .env <<EOF
DJANGO_SECRET_KEY=dbms-project-dev-key
DJANGO_DEBUG=true
MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_HOST=$MYSQL_HOST
MYSQL_PORT=$MYSQL_PORT
MySQL_database=$MYSQL_DATABASE
MySQL_user=$MYSQL_USER
MySQL_password=$MYSQL_PASSWORD
MySQL_host=$MYSQL_HOST
MySQL_port=$MYSQL_PORT
EOF

echo "Testing MySQL connection and preparing schema..."
if ! "DB_venv/Scripts/python.exe" scripts/mysql_setup.py \
  --host "$MYSQL_HOST" \
  --port "$MYSQL_PORT" \
  --user "$MYSQL_USER" \
  --password "$MYSQL_PASSWORD" \
  --database "$MYSQL_DATABASE"; then
  echo
  echo "ERROR: Setup stopped because MySQL connection/schema setup failed." >&2
  echo "Check that MySQL is running and the username/password are correct." >&2
  exit 1
fi

echo "Installing frontend dependencies..."
(cd frontend && npm install)

echo
echo "Setup completed successfully."
read -r -p "Start backend and frontend now? [Y/N]: " START_NOW
if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
  "$ROOT_DIR/run_windows.sh"
fi
