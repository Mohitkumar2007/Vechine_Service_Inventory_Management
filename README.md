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

