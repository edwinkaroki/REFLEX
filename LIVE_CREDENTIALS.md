# REFLEX Live Credentials & Setup

## Database & Backend Status
- **Database**: Docker PostgreSQL container `reflex-postgres` (running)
- **Backend API**: Running on `http://127.0.0.1:8001` (port 8001, not 8000)
- **Frontend**: Configured to connect to port 8001
- **Database URL**: `postgresql+psycopg://reflex:reflex@localhost:5432/reflex`

## Real User Accounts (Docker/Postgres)

All passwords have been set to valid bcrypt hashes in the live database.

### Retailer Persona
- **Email**: `jane@retailer.com`
- **Password**: `retailer123`
- **User ID**: `11111111-1111-1111-1111-111111111111`
- **Role**: retailer

### Dispatcher Persona
- **Email**: `dan@dispatch.com`
- **Password**: `dispatcher123`
- **User ID**: `22222222-2222-2222-2222-222222222222`
- **Role**: dispatcher

### Rider Personas
1. **Rider One**
   - **Email**: `rider1@fleet.com`
   - **Password**: `rider123`
   - **User ID**: `33333333-3333-3333-3333-333333333333`

2. **Rider Two**
   - **Email**: `rider2@fleet.com`
   - **Password**: `rider123`
   - **User ID**: `44444444-4444-4444-4444-444444444444`

3. **Test Rider**
   - **Email**: `testrider@test.com`
   - **Password**: `test123`
   - **User ID**: `N/A` (test account)

## How to Start the App

1. **Ensure Docker containers are running**
   ```powershell
   docker ps  # Verify reflex-postgres is running
   ```

2. **Start the FastAPI backend** (if not already running)
   ```powershell
   cd reflex/backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
   # Backend will be available at http://127.0.0.1:8001
   ```

3. **Start the React frontend** (in another terminal)
   ```powershell
   cd reflex
   npm run dev
   # Frontend will be available at http://localhost:5173
   ```

4. **Log in using any of the above credentials**
   - Select a persona (Dispatcher, Retailer, or Rider)
   - Enter the email and password
   - You will receive a real JWT token from the backend
   - The app will display the appropriate dashboard for that role
5. **Logging out**
Open the browser DevTools on the page, then paste this into the Console tab:

localStorage.removeItem("access_token");
localStorage.removeItem("user_role");
localStorage.removeItem("user_id");
location.reload();
## Verification Checklist

- ✅ Backend API endpoint: `POST /api/auth/login`
- ✅ Retailer login tested and working
- ✅ Dispatcher login tested and working
- ✅ Rider login tested and working
- ✅ Frontend API URLs updated to port 8001
- ✅ Frontend build successful
- ✅ PostgreSQL seeded accounts updated with valid bcrypt hashes

## Next Steps

- Start the frontend dev server and test persona switching via the login page
- Verify that each persona dashboard loads correctly with real data from the backend
- Test the dispatcher, retailer, and rider workflows against the live API
