#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [[ -x "DB_venv/Scripts/python.exe" ]]; then
  VENV_PYTHON="DB_venv/Scripts/python.exe"
elif [[ -x "DB_venv/bin/python" ]]; then
  VENV_PYTHON="DB_venv/bin/python"
else
  echo "ERROR: DB_venv was not found. Run setup_windows.sh first." >&2
  exit 1
fi

if [[ ! -f ".env" ]]; then
  echo "ERROR: .env was not found. Run setup_windows.sh first." >&2
  exit 1
fi

if command -v cmd.exe >/dev/null 2>&1; then
  if command -v cygpath >/dev/null 2>&1; then
    WIN_ROOT="$(cygpath -w "$ROOT_DIR")"
  else
    WIN_ROOT="$ROOT_DIR"
  fi

  echo "Starting Django backend on http://127.0.0.1:8000"
  cmd.exe /c start "Vehicle Service Backend" cmd /k "cd /d \"$WIN_ROOT\\backend\" && ..\\DB_venv\\Scripts\\python.exe manage.py runserver 8000"

  echo "Starting React frontend on http://localhost:3000"
  cmd.exe /c start "Vehicle Service Frontend" cmd /k "cd /d \"$WIN_ROOT\\frontend\" && npm run dev"

  echo
  echo "Servers are starting in separate windows."
else
  echo "Starting Django backend on http://0.0.0.0:8000"
  nohup "$VENV_PYTHON" backend/manage.py runserver 0.0.0.0:8000 > backend/server.out.log 2> backend/server.err.log &
  BACKEND_PID=$!

  echo "Starting React frontend on http://0.0.0.0:3000"
  (cd frontend && nohup npm run dev -- --host 0.0.0.0 > server.out.log 2> server.err.log &)

  echo
  echo "Servers started in the background."
  echo "Backend PID: $BACKEND_PID"
  echo "Backend logs: backend/server.out.log and backend/server.err.log"
  echo "Frontend logs: frontend/server.out.log and frontend/server.err.log"
fi
