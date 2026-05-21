# Vehicle Service Inventory Management System

Full-stack DBMS project for an automobile service center with role-based dashboards for Reception, Mechanic, Billing Counter, and Owner/Admin.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Framer Motion/Motion, Lucide icons
- Backend: Django REST Framework
- Database: MySQL

## Project Structure

```text
backend/    Django REST API
database/   MySQL schema, Oracle reference schema, CRUD queries, ER explanation
frontend/   React dashboard UI
```

## Setup

### Windows automatic setup

Use Command Prompt or PowerShell:

```powershell
.\setup_windows.bat
```

Or use Git Bash:

```bash
./setup_windows.sh
```

On Azure/Linux, the same `.sh` script works. Install system prerequisites first if needed:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm
bash setup_windows.sh
```

The setup script asks for MySQL host, port, database name, username, and password. The default hosted MySQL target is `15.134.39.121:3306` with username `mohit`, matching:

```bash
mysql -h 15.134.39.121 -P 3306 -u mohit -p
```

It writes `.env`, tests the MySQL connection, imports `database/mysql_schema.sql`, installs backend/frontend dependencies, and can start both servers. If your hosted MySQL requires encrypted connections, answer `Y` when the script asks about SSL.

If setup says `Access denied ... to database 'vehicle_service_db'`, the password is correct but the MySQL user does not have database privileges. Run this once on the MySQL server using an admin/root account:

```sql
CREATE DATABASE IF NOT EXISTS vehicle_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON vehicle_service_db.* TO 'mohit'@'%';
FLUSH PRIVILEGES;
```

Then rerun `bash setup_windows.sh`.

To run the project later:

```powershell
.\run_windows.bat
```

or:

```bash
./run_windows.sh
```

On Linux/Azure, `run_windows.sh` starts the backend on `0.0.0.0:8000` and the frontend on `0.0.0.0:3000` in the background.

### Manual setup

1. Create a local `.env` from `.env.example` and set your MySQL password.
2. Create/import the database:

```powershell
mysql -u root -p < database\mysql_schema.sql
```

3. Install and run the backend:

```powershell
.\DB_venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\DB_venv\Scripts\python.exe backend\manage.py runserver 8000
```

4. Install and run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:3000`

## Demo Users

```text
admin / admin123
reception / reception123
mechanic / mechanic123
billing / billing123
```

## Push Notes

Do not commit `.env`, `DB_venv`, `node_modules`, `dist`, logs, or Python cache folders. They are ignored by the root `.gitignore`.
