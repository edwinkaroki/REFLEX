# REFLEX Development Setup & Credentials

## 1. Current System Status

The integrated REFLEX backend currently contains:

* **Retailer backend** ✅
* **Dispatcher backend** ✅
* **Rider backend** ✅
* **PostgreSQL database** ✅
* **Authentication/JWT** ✅
* **Deliveries & assignments** ✅
* **Notifications** ✅
* **WebSockets/realtime updates** ✅

The current integration branch contains the combined backend and should be used for full-system testing.

### Ports

| Service         | Address                 |
| --------------- | ----------------------- |
| React frontend  | `http://localhost:5173` |
| FastAPI backend | `http://127.0.0.1:8001` |
| PostgreSQL      | `localhost:5432`        |

**Important:** The backend runs on **port 8001**, not 8000.

---

# 2. Prerequisites

Each developer should have installed:

* Git
* Python 3.x
* Node.js/npm
* Docker Desktop

Verify the installations:

```powershell
git --version
python --version
node --version
npm --version
docker --version
```

Make sure Docker Desktop is running before starting PostgreSQL.

---

# 3. Get the Project

Clone the repository if you do not already have it:

```powershell
git clone https://github.com/edwinkaroki/REFLEX.git
cd REFLEX  
```

Fetch the latest branches:

```powershell
git fetch origin
```

For full integration testing, switch to:

```powershell
git switch backend-dispatcher-retailer
```

Then update it:

```powershell
git pull origin backend-dispatcher-retailer
```

---

# 4. PostgreSQL with Docker

REFLEX uses PostgreSQL 16 through Docker.

The expected container is:

```text
reflex-postgres
```

The database configuration is:

```text
Database: reflex
Username: reflex
Password: reflex
Host: localhost
Port: 5432
```

The SQLAlchemy connection string is:

```text
postgresql+psycopg://reflex:reflex@localhost:5432/reflex
```

## Check whether PostgreSQL is already running

Run:

```powershell
docker ps
```

You should see something similar to:

```text
CONTAINER ID   IMAGE         PORTS
xxxxxxxx       postgres:16   0.0.0.0:5432->5432/tcp
```

and the container should be named:

```text
reflex-postgres
```

---

# 5. If `reflex-postgres` Does Not Exist

Create the PostgreSQL container with:

```powershell
docker run --name reflex-postgres `
  -e POSTGRES_USER=reflex `
  -e POSTGRES_PASSWORD=reflex `
  -e POSTGRES_DB=reflex `
  -p 5432:5432 `
  -d postgres:16
```

Then verify:

```powershell
docker ps
```

You should now see:

```text
reflex-postgres
```

running on port `5432`.

## Test the database

Run:

```powershell
docker exec -it reflex-postgres psql -U reflex -d reflex -c "\dt"
```

The REFLEX database should contain the required tables, including:

```text
assignments
deliveries
delivery_events
notifications
rider_locations
riders
users
```

**Do not drop or recreate the database if it already contains project data.**

---

# 6. PostgreSQL Persistence

The PostgreSQL container should ideally use a Docker volume so that the database survives container recreation.

For a persistent setup, the container should be configured with a volume, for example:

```powershell
docker volume create reflex-postgres-data
```

If creating a new container from scratch, use:

```powershell
docker run --name reflex-postgres `
  -e POSTGRES_USER=reflex `
  -e POSTGRES_PASSWORD=reflex `
  -e POSTGRES_DB=reflex `
  -p 5432:5432 `
  -v reflex-postgres-data:/var/lib/postgresql/data `
  -d postgres:16
```

This prevents the database from being tied only to the container lifecycle.

---

# 7. Backend Environment

Go to the backend:

```powershell
cd backend
```

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

The `.env` should contain:

```env
APP_NAME=Reflex API
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg://reflex:reflex@localhost:5432/reflex
SECRET_KEY=replace-this-with-a-local-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
```

Do **not** commit `.env` to Git.

Each developer should have their own local secret key.

---

# 8. Python Virtual Environment

From:

```text
REFLEX/backend
```

create a virtual environment if you do not already have one:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

You should see:

```text
(.venv)
```

Install backend dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The backend uses:

* FastAPI
* Uvicorn
* Pydantic Settings
* SQLAlchemy
* psycopg
* Alembic
* python-jose
* Passlib/bcrypt
* Pytest
* HTTPX

---

# 9. Start the FastAPI Backend

From:

```text
REFLEX/backend
```

with the virtual environment activated:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

The API will be available at:

```text
http://127.0.0.1:8001
```

## Verify the backend

Open:

```text
http://127.0.0.1:8001/health
```

Expected response:

```json
{
  "status": "ok"
}
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8001/docs
```

---

# 10. Start the React Frontend

Open a **second terminal**.

Go to the project root:

```powershell
cd C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex
```

Install frontend dependencies if necessary:

```powershell
npm install
```

Start Vite:

```powershell
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The frontend is configured to communicate with the FastAPI backend on:

```text
http://127.0.0.1:8001
```

---

# 11. Test User Accounts

The development PostgreSQL database contains the following test accounts.

## Retailer

```text
Email: jane@retailer.com
Password: retailer123
User ID: 11111111-1111-1111-1111-111111111111
Role: retailer
```

## Dispatcher

```text
Email: dan@dispatch.com
Password: dispatcher123
User ID: 22222222-2222-2222-2222-222222222222
Role: dispatcher
```

## Rider One

```text
Email: rider1@fleet.com
Password: rider123
User ID: 33333333-3333-3333-3333-333333333333
Role: rider
```

## Rider Two

```text
Email: rider2@fleet.com
Password: rider123
User ID: 44444444-4444-4444-4444-444444444444
Role: rider
```

## Test Rider

```text
Email: testrider@test.com
Password: test123
User ID: N/A
Role: rider
```

These are **development/test credentials only**. Do not use them for production.

---

# 12. Authentication

The main authentication endpoint is:

```text
POST /api/auth/login
```

Successful login returns a JWT access token.

The frontend stores the authentication information locally and uses the token when communicating with protected backend endpoints.

---

# 13. Logging Out / Clearing Local Authentication

If the frontend gets stuck on the wrong persona or an old token needs to be removed, open the browser DevTools → Console and run:

```javascript
localStorage.removeItem("access_token");
localStorage.removeItem("user_role");
localStorage.removeItem("user_id");
location.reload();
```

You can then log in again.

---

# 14. Full Persona Integration Test

The system should be tested as an integrated workflow rather than testing each dashboard independently.

## Step 1 — Retailer

Log in as:

```text
jane@retailer.com
```

Create a delivery.

Expected:

```text
Retailer creates delivery
        ↓
PostgreSQL
        ↓
Dispatcher receives delivery
```

## Step 2 — Dispatcher

Log in as:

```text
dan@dispatch.com
```

Confirm the new delivery appears.

Assign the delivery to a Rider.

Expected:

```text
Dispatcher assigns Rider
        ↓
PostgreSQL assignment
        ↓
Rider receives assignment
```

## Step 3 — Rider

Log in as:

```text
rider1@fleet.com
```

Confirm that the assigned delivery appears on the Rider dashboard.

The Rider should be able to perform the supported delivery lifecycle actions.

## Step 4 — Realtime/WebSockets

With the relevant dashboards open simultaneously, verify that changes propagate without manually refreshing the pages.

Test:

```text
Retailer creates delivery
        ↓
Dispatcher updates automatically

Dispatcher assigns Rider
        ↓
Rider updates automatically

Rider changes delivery status
        ↓
Dispatcher/Retailer update automatically
```

---

# 15. Expected Delivery Lifecycle

Where supported by the API, the delivery should move through the agreed statuses:

```text
pending
   ↓
assigned
   ↓
accepted
   ↓
picked_up
   ↓
out_for_delivery
   ↓
delivered
```

Failure/cancellation paths should use the existing project contract:

```text
failed
cancelled
```

Do not introduce new status names without agreement from the team.

---

# 16. Rider Status

Rider availability/status values are:

```text
available
busy
offline
```

These values should remain consistent across the Rider, Dispatcher, database, and API.

---

# 17. Database Safety

Developers should **not** run commands that destroy or reset the shared development database unless explicitly instructed.

Do NOT casually run:

```powershell
docker rm -f reflex-postgres
```

or database commands that drop tables/data.

Before modifying database structure, confirm the expected schema and migration strategy with the team.

---

# 18. Troubleshooting

## PostgreSQL is not running

Check:

```powershell
docker ps
```

Start an existing stopped container:

```powershell
docker start reflex-postgres
```

Then verify:

```powershell
docker ps
```

## Port 5432 is already in use

Check:

```powershell
netstat -ano | findstr :5432
```

Do not immediately change the application's database port. First determine what is already using port 5432.

## Backend cannot connect to PostgreSQL

Confirm:

```text
Container: reflex-postgres
Host: localhost
Port: 5432
Database: reflex
Username: reflex
Password: reflex
```

Then test:

```powershell
docker exec -it reflex-postgres psql -U reflex -d reflex -c "SELECT 1;"
```

## Backend will not start

Make sure the virtual environment is active:

```powershell
.\.venv\Scripts\Activate.ps1
```

Then reinstall dependencies:

```powershell
pip install -r requirements.txt
```

## Frontend cannot reach backend

Confirm FastAPI is running on:

```text
http://127.0.0.1:8001
```

and that the frontend is configured for port `8001`, not `8000`.

---

# 19. Recommended Terminal Setup

For development, use three terminals.

### Terminal 1 — PostgreSQL

Docker Desktop should be running.

Verify:

```powershell
docker ps
```

### Terminal 2 — Backend

```powershell
cd C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Terminal 3 — Frontend

```powershell
cd C:\Users\IANNERET\OneDrive\Desktop\Dispatcher\reflex
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 20. Final Verification Checklist

Before reporting that your local environment is working:

### Infrastructure

* [ ] Docker Desktop running
* [ ] `reflex-postgres` running
* [ ] PostgreSQL accessible on port 5432
* [ ] `reflex` database accessible

### Backend

* [ ] Python environment activated
* [ ] Dependencies installed
* [ ] `.env` configured
* [ ] FastAPI starts successfully
* [ ] `/health` returns `{"status":"ok"}`
* [ ] `/docs` loads

### Frontend

* [ ] `npm install` completed
* [ ] `npm run dev` works
* [ ] Frontend loads on port 5173
* [ ] Frontend communicates with backend on port 8001

### Authentication

* [ ] Retailer login works
* [ ] Dispatcher login works
* [ ] Rider login works
* [ ] JWT authentication works
* [ ] Correct dashboard loads for each role

### Integration

* [ ] Retailer can create a delivery
* [ ] Dispatcher can see the delivery
* [ ] Dispatcher can assign a Rider
* [ ] Rider can see the assignment
* [ ] Rider can update the delivery
* [ ] Dispatcher receives Rider updates
* [ ] Retailer receives appropriate delivery updates
* [ ] WebSocket/realtime updates work without page refresh

---

# 21. Git Workflow

The current integration branch is:

```text
backend-dispatcher-retailer
```

Feature branches should be integrated into this branch first for testing.

For example:

```text
rider-backend
      ↓
backend-dispatcher-retailer

backend-websockets
      ↓
backend-dispatcher-retailer
```

After the complete integrated system has been tested and approved:

```text
backend-dispatcher-retailer
          ↓
         main
```

Developers should **not bypass the integration/testing branch by directly merging unfinished feature branches into ****`main`**.

The goal is to keep `main` stable while the integration branch is used to verify that Retailer, Dispatcher, Rider, database, notifications, and WebSockets work together.
