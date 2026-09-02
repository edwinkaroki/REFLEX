# Reflex Project Setup Guide

This guide covers the full local setup for the REFLEX app, the rider profile flow, live login behavior, and how to clear stored session data when testing.

## 1) Project overview

The app has three user personas:

- Dispatcher
- Retailer
- Rider

The backend is a FastAPI app with PostgreSQL. The frontend is a Vite + React app.

Key folders:

- Frontend: `reflex/src`
- Backend: `reflex/backend`
- Database migrations: `reflex/backend/migrations`

## 2) Required tools

Install these before running the project:

- Node.js 18+
- npm
- Python 3.11+ or 3.12+
- Docker Desktop
- PostgreSQL client tools (optional, helpful for DB checks)

## 3) Install frontend dependencies

From the project root:

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex"
npm install
```

## 4) Install backend dependencies

From the backend folder:

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If you are using the system Python instead of the local venv, use the exact interpreter path when starting uvicorn.

## 5) Start PostgreSQL with Docker

Check whether the DB container is already running:

```powershell
docker ps
```

If the `reflex-postgres` container is not running, start it with Docker Compose or the equivalent local container config. The app expects PostgreSQL at:

```text
postgresql+psycopg://reflex:reflex@localhost:5432/reflex
```

This is configured in the backend environment file and app config.

## 6) Start the backend

Use this exact command in PowerShell:

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex\backend"
$env:PYTHONPATH="."
& "C:/Program Files/Python314/python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Expected success output:

```text
INFO:     Uvicorn running on http://127.0.0.1:8001
```

Notes:

- Use port `8001` for the app
- Do not leave a stale process bound to port `8001`
- If you get `Errno 10048`, free the port first

To free a stale port:

```powershell
netstat -ano | findstr :8001
Stop-Process -Id <PID> -Force
```

## 7) Start the frontend

In a new terminal:

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex"
npm run dev -- --host 127.0.0.1
```

Open the app in the browser:

```text
http://127.0.0.1:5173
```

## 8) Real live login credentials

These are the current Docker/Postgres-backed accounts used for testing:

### Dispatcher

- Email: `dan@dispatch.com`
- Password: `dispatcher123`

### Retailer

- Email: `jane@retailer.com`
- Password: `retailer123`

### Rider

- Email: `rider1@fleet.com`
- Password: `rider123`

There is also a secondary rider account:

- Email: `rider2@fleet.com`
- Password: `rider123`

## 9) Rider profile setup and behavior

The rider workspace is focused on the rider profile, assigned deliveries, and status tracking.

### Rider responsibilities

- Sign in as a rider
- View rider profile information
- View assigned deliveries
- Update delivery status while on route
- Share location updates
- Confirm QR handoff when required
- Manage availability state

Main rider files:

- `reflex/src/pages/rider/RiderDashboard.jsx`
- `reflex/src/pages/rider/RiderDeliveries.jsx`
- `reflex/src/pages/rider/RiderProfile.jsx`
- `reflex/src/pages/rider/RiderNotifications.jsx`
- `reflex/src/services/riderApi.js`

### Rider profile data

The rider profile is backed by the backend and should not be mocked. It is fetched via the authenticated user identity.

Typical rider data includes:

- name
- phone
- vehicle type
- availability
- current delivery information

### Rider availability states

The current valid states align with the backend contract:

- `available`
- `busy`
- `offline`

The current delivery status flow is aligned to the schema contract:

- `assigned`
- `picked_up`
- `in_transit`
- `delivered`

## 10) How to log out

Use the **Logout** button in the sidebar. It clears the current browser session and returns you to the login page.

If the app is stuck on an old session, you can use the browser storage fallback below.

If you want to return to the login page, clear the browser storage for the app.

Open the browser DevTools Console and run:

```js
localStorage.removeItem("access_token");
localStorage.removeItem("user_role");
localStorage.removeItem("user_id");
location.reload();
```

This resets the current authenticated session and returns the app to the login screen.

## 11) How to switch personas in demo mode

The app should not allow swapping roles inside the sidebar after login. The user must sign out or clear session storage and log in again through the real login page.

This is intentional for demo security and contract matching.

## 12) Common setup issues and fixes

### Issue: `No module named 'app'`

This happens when the backend is not started from the correct folder or without Python path configuration.

Fix:

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex\backend"
$env:PYTHONPATH="."
& "C:/Program Files/Python314/python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Issue: port 8001 already in use

Check and remove the stale process:

```powershell
netstat -ano | findstr :8001
Stop-Process -Id <PID> -Force
```

### Issue: login request fails with CORS preflight error

The backend must allow both localhost and 127.0.0.1.

The CORS config must include:

```python
"http://localhost:5173",
"http://127.0.0.1:5173",
```

## 13) Demo workflow

Use this flow to test all personas:

### Dispatcher flow

1. Sign in as `dan@dispatch.com`
2. Ensure the dispatcher dashboard loads
3. Confirm deliveries appear from the database
4. Check rider data and assignment views

### Retailer flow

1. Sign in as `jane@retailer.com`
2. Create a delivery request
3. Confirm the delivery is stored in the database
4. Sign out and log in as dispatcher
5. Confirm the new delivery appears in dispatcher view

### Rider flow

1. Sign in as `rider1@fleet.com`
2. Check profile page and availability
3. Review active or assigned delivery
4. Update status and verify UI changes

## 14) Final checklist before demo

- Backend running on `127.0.0.1:8001`
- Frontend running on `127.0.0.1:5173`
- PostgreSQL container running
- Valid user accounts exist
- Local storage cleared before switching personas
- CORS includes both `localhost` and `127.0.0.1`
- `npm run build` succeeds

## 15) Helpful commands

### Start backend

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex\backend"
$env:PYTHONPATH="."
& "C:/Program Files/Python314/python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Start frontend

```powershell
cd "C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex"
npm run dev -- --host 127.0.0.1
```

### Clear current session in browser console

```js
localStorage.removeItem("access_token");
localStorage.removeItem("user_role");
localStorage.removeItem("user_id");
location.reload();
```

This guide should be enough to set up, run, and test the project locally with the rider profile, login flow, and role-based access correctly.
