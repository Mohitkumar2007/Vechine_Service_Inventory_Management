# Vehicle Service Inventory Management Backend

Django REST API for the Vehicle Service Inventory Management System.

## Setup

```powershell
cd path\to\DBMS PROJECT
.\DB_venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\DB_venv\Scripts\python.exe backend\manage.py runserver 8000
```

MySQL credentials are read from the root `.env`. Use `.env.example` as the template.

Import the database schema before starting the API:

```powershell
mysql -u root -p < database\mysql_schema.sql
```

## Auth Flow

`POST /api/auth/login/`

```json
{ "username": "admin", "password": "admin123" }
```

The response returns the role. Frontend/API requests should send `X-Role: ADMIN`, `RECEPTION`, `MECHANIC`, or `BILLING` for role checks.

## Role Logic

Reception can manage customers, vehicles, appointments, and previous bills. Mechanic can view assigned jobs, update status, and add parts. Billing can create bills/payments. Admin has full report and management access.
