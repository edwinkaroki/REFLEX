 
## Before Starting

After cloning the repository:

npm install

Run the application:

npm run dev

Make sure the existing application works before changing anything.

If the application doesn't run, tell me before modifying the project.

## What To Edit

Each persona developer should work only in their assigned page and supporting components:

| Persona | Main file | Owns |
| --- | --- | --- |
| Dispatcher | `src/pages/dispatcher/DispatcherDashboard.jsx` | Delivery assignment, rider management, operations overview |
| Retailer | `src/pages/retailer/RetailerDashboard.jsx` | Business profile, new deliveries, retailer delivery history |
| Rider | `src/pages/rider/RiderDashboard.jsx` | Rider profile, assigned deliveries, QR scanning, status updates |

Persona-specific components can be added under the matching folder:

```text
src/components/retailer/
src/components/rider/
```

Do not copy the entire project into a new app. The shared app already routes users to the correct page in `src/App.jsx`.

## Shared Files

These files belong to the platform and should be changed only when the change benefits all personas:

- `src/components/shared/Sidebar.jsx` - brand, workspace switcher, and role-specific operations list.
- `src/components/shared/RoleSwitcher.jsx` - development persona switcher.
- `src/index.css` - shared Reflex colors, layout, typography, and responsive styles.
- `src/services/api.js` - shared API client and request helpers.
- `src/services/websocket.js` - shared real-time connection helpers.
- `src/data/mockData.js` - temporary local development data.

The role switcher is for development only. In production, the backend should determine the user role after login. A retailer or rider must not be able to select `dispatcher` in the production UI.

## Persona Navigation

Role-specific sidebar operations are defined in `src/components/shared/Sidebar.jsx`:

```js
dispatcher: [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Deliveries", icon: Truck },
],
retailer: [
  { name: "Overview", icon: LayoutDashboard },
  { name: "My deliveries", icon: Truck },
  { name: "New delivery", icon: PlusCircle },
],
rider: [
  { name: "Overview", icon: LayoutDashboard },
  { name: "My deliveries", icon: Truck },
  { name: "Scan QR code", icon: ScanQrCode },
],
```

YOu may replace entries inside their own role list. Keep the shared sidebar layout and class names intact unless the change is approved for all roles.

## Shared Naming Contract

These names must match across the frontend, backend, database mapping, and real-time events.

### User roles

Use exactly:

```text
dispatcher
retailer
rider
```

Do not use variants such as `driver`, `merchant`, `admin`, `Dispatcher`, or `retail_user` without updating the complete application contract.

### Delivery fields

The current frontend uses these names:

```js
{
  id: "DL-1048",
  customer_name: "Maya Okafor",
  address: "18 Palm Avenue",
  status: "pending",
  rider_id: null
}
```

Keep these field names stable:

- `id`
- `customer_name`
- `address`
- `status`
- `rider_id`

If the backend prefers camelCase, translate it once inside `src/services/api.js` rather than mixing `rider_id` and `riderId` throughout the UI.

### Delivery statuses

Use exactly these machine values:

```text
pending
assigned
picked_up
out_for_delivery
delivered
```

Use the existing `StatusBadge` component for display labels. Do not create alternatives such as `pickedUp`, `out-for-delivery`, or `complete` without updating every persona and the backend.

### Rider statuses

Use exactly:

```text
available
on_delivery
```

Additional statuses should be agreed on before implementation because they affect dispatcher availability, rider actions, and status badges.

## API Agreement

Before connecting a persona to the backend, document the request and response shape in the relevant pull request. At minimum, agree on:

- Authentication and the authenticated user's `role`.
- Which user owns each retailer or rider profile.
- Who can create, assign, scan, and update a delivery.
- Delivery status transition rules.
- QR code payload format and expiration behavior.
- Error response format.
- Real-time event names.

Suggested event names are:

```text
delivery.created
delivery.assigned
delivery.status_updated
rider.location_updated
```

Do not put real API keys, passwords, or production URLs in the repository. Add them to a local `.env` file and document their names in `.env.example`.

## Pull Request Rules

1. Keep persona feature work inside the persona page/folder when possible.
2. Reuse shared components and the existing color tokens.
3. Do not rename shared fields or statuses casually.
4. Explain any API, database, or event-contract changes in the pull request.
5. Run `npm run build` and `npm run lint` before handing work back.

## Git Workflow

## Do NOT work directly on main.

First create your own branch.

## Retailer
git checkout -b retailer
## Rider
git checkout -b rider
## Dispatcher
git checkout -b dispatcher

Then work only on your assigned features.

 
## Commit Your Work

When you finish a meaningful piece of work:

git add .
git commit -m "Add retailer delivery form"

## Then push your branch: (NB)

git push -u origin retailer

or:

git push -u origin rider
## Pull Requests

When your dashboard is ready, create a Pull Request into main.

Do not directly merge your branch into main.

I will review and test the changes before merging.

## Avoiding Conflicts
You CAN freely modify:

Your own dashboard:

src/pages/retailer/

or:

src/pages/rider/

and your own components:

src/components/retailer/

or:

src/components/rider/
Avoid modifying without discussion:
src/components/shared/
src/App.jsx
src/services/api.js
src/services/websocket.js
src/data/mockData.js

These files affect multiple parts of the application.

If you need one changed, communicate with the team first.

## AI Usage

AI can be used to help write code, but you are responsible for checking the code before pushing it.

Before committing AI-generated code:

Make sure it actually works.
Check that it doesn't delete existing functionality.
Check that it doesn't create duplicate components.
Check that it follows the existing folder structure.
Check that it doesn't install unnecessary packages.
Run the application.
Check the browser console for errors.

Do not paste an entire AI-generated project over the existing project.

Ask AI to modify your assigned files/components instead.

## Final Goal

We are building:

                    REFLEX
                       │
              Shared React UI
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
  Dispatcher        Retailer          Rider
  Dashboard         Dashboard        Dashboard
       │               │               │
       └───────────────┼───────────────┘
                       ↓
                    FastAPI
                       ↓
                  PostgreSQL
                       ↓
                  WebSockets
<<<<<<< HEAD
                  import {
	connectWebSocket,
	disconnectWebSocket,
} from "../../services/websocket";

## Retailer Dashboard

The retailer dashboard is API-ready and waits for the backend. It must not use mock deliveries, fake riders, localStorage business data, fake notifications, or WebSockets yet.

Retailer responsibilities:

- Manage retailer profile.
- Create delivery requests.
- View deliveries created by the authenticated retailer.
- Monitor delivery status and delivery history.
- View the assigned rider when the API provides one.

Retailer implementation files:

- `src/pages/retailer/RetailerDashboard.jsx`
- `src/services/retailerApi.jsx`

Expected endpoints:

```text
GET    /api/retailer/profile
PATCH  /api/retailer/profile
POST   /api/deliveries
GET    /api/deliveries/my
GET    /api/deliveries/:id
```

All retailer requests use the token from `localStorage.getItem("access_token")` only for authentication. Do not store profiles, deliveries, riders, or application state in localStorage.

After `POST /api/deliveries` succeeds, the backend is responsible for making the new delivery available to the Dispatcher. The frontend does not simulate this with browser events, mock notifications, or WebSockets.

The retailer UI must show loading, empty, success, authentication-missing, and API-error states. If the API is unavailable, show an error and do not replace it with fake data.

The frontend is ready for the REST API but is waiting for backend implementation. WebSockets and real-time communication are intentionally not implemented yet.
=======

---

## Rider Workspace

The Rider persona is a delivery worker who:

- Receives deliveries assigned by the dispatcher
- Views their assigned/current delivery with customer and delivery details
- Updates delivery status as the delivery progresses (accepted, picked up, out for delivery, delivered)
- Can report a failed delivery where appropriate
- Can see their complete delivery history
- Can view notifications related to assignments and delivery updates
- Can view and manage their own rider profile with availability status
- Can scan a QR code to quickly accept and track deliveries

**The Rider CANNOT:**
- Assign deliveries to other riders (dispatcher-only operation)
- Access retailer or dispatcher dashboards
- Create fake delivery data

### Rider Features

#### 1. Rider Status & Availability
- Display rider's current status: Available, Busy/On delivery, Offline
- Allow riders to update their availability status
- Show rider ID, name, phone, and vehicle information
- Status data comes exclusively from the backend API

#### 2. Current Delivery
- Display the currently assigned delivery when one exists
- Show: delivery/order ID, customer name, customer phone, delivery address, package info, status
- Display when assignment was made
- Show clean empty state ("No active delivery") when none exists
- Do NOT create fake deliveries to populate this section

#### 3. Delivery Status Actions
- Provide contextual buttons based on current delivery status:
  - **assigned** → Accept/confirm delivery
  - **accepted** → Mark as picked up
  - **picked_up** → Mark as out for delivery
  - **out_for_delivery** → Mark as delivered
  - **any status** → Report failed delivery (with reason)
- Only display valid actions for the current status
- Send status changes to the backend API
- Update UI only after backend confirms the operation

#### 4. Rider Statistics
- Display dashboard statistics:
  - Active deliveries (current)
  - Completed today
  - Failed today
  - Total deliveries
- All statistics come from the API; empty/zero if API not available
- No fake data is used

#### 5. Delivery History
- View all past deliveries with filters (all, delivered, failed, pending)
- Display: delivery ID, customer, address, date/time, final status, failure reason if applicable
- Support statuses: delivered, failed, cancelled
- Do NOT use localStorage for history records

#### 6. Notifications
- Display notification feed with:
  - New delivery assigned
  - Delivery status updates
  - Delivery assignment changes
  - Dispatcher/system messages
- Show notification type, message, timestamp, and delivery ID
- Mark unread notifications with visual indicator
- Build the UI without fake notifications

#### 7. Rider Profile
- Display rider information from backend:
  - Rider ID, name, email, phone
  - Vehicle type and registration details
  - Current location (if available)
  - Account creation date and last update
- Allow rider to update availability status
- Show current status with quick-update buttons (Available, Busy, Offline)
- Do NOT store profile data in localStorage; always fetch from API

#### 8. QR Code Scanner
- Prepare button to scan delivery QR codes
- When backend provides QR scanning endpoint, integrate actual QR scanner
- For now, demonstrates the UI flow without actual hardware scanner

### Rider API Service Layer

All Rider API calls are isolated in `src/services/riderApi.js` to ensure:
- Easy API endpoint changes when backend is finalized
- Consistent error handling across all requests
- Clear separation between UI and API logic

**Available functions:**
- `getMyProfile(token)` - Get logged-in rider profile
- `getCurrentDelivery(token)` - Get rider's currently assigned delivery
- `getMyDeliveries(token, params)` - Get delivery history with filtering
- `updateDeliveryStatus(deliveryId, status, token)` - Update delivery status
- `updateMyAvailability(status, token)` - Update rider's availability
- `getMyNotifications(token)` - Get rider's notifications
- `getMyDeliveryStats(token)` - Get daily statistics
- `scanDeliveryQR(qrCode, token)` - Process QR code scan
- `reportFailedDelivery(deliveryId, reason, token)` - Report delivery failure

### Rider Authentication

- All protected requests use Bearer token from `localStorage.getItem("access_token")`
- Token is sent in Authorization header: `Authorization: Bearer <token>`
- If no token exists, the UI shows appropriate authentication state
- No fake logged-in riders are created

### Rider UI/UX
- Matches existing Reflex visual style
- Reuses shared components: Sidebar, StatusBadge, StatCard
- Proper loading states with spinner and message
- Proper error states with retry button
- Responsive layouts (mobile, tablet, desktop)
- Clean empty states when no data exists
- No hard-coded example data (names, IDs, addresses)

### Current Status

✅ **Implemented:**
- Backend-ready Rider Dashboard with all required sections
- Separate pages for Deliveries, Notifications, Profile
- Complete API service layer (riderApi.js)
- Fetch-based HTTP client (api.js)
- Error handling and loading states
- Authentication token management
- Navigation between rider pages

⏳ **Awaiting Backend:**
- Actual API endpoints (marked as TBD)
- Real delivery data from backend database
- Authentication system
- WebSocket for real-time updates (optional)
- QR code scanner hardware/library integration

---

## Rider API Requirements

The Rider frontend is **backend-ready** and depends on the following API contract.

All endpoints require authentication via `Authorization: Bearer <access_token>` header.

### API Endpoints (TBD - Backend Team Confirmation Required)

| Operation | Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- | --- |
| Get Rider Profile | TBD | TBD | Fetch logged-in rider's information (name, ID, phone, vehicle, status) | Bearer token |
| Get Current Delivery | TBD | TBD | Get the rider's currently assigned delivery (one delivery or null) | Bearer token |
| Get Delivery History | TBD | TBD | Fetch list of all past deliveries with optional filtering (status, date) | Bearer token |
| Update Delivery Status | TBD | TBD | Update a delivery's status (accepted, picked_up, out_for_delivery, delivered, failed) | Bearer token |
| Get Notifications | TBD | TBD | Fetch list of notifications (new assignments, status updates, system messages) | Bearer token |
| Get Statistics | TBD | TBD | Fetch daily statistics (active, completed today, failed today, total) | Bearer token |
| Update Availability | TBD | TBD | Update rider's availability status (available, busy, offline) | Bearer token |
| Scan QR Code | TBD | TBD | Process a delivery QR code scan and auto-accept if valid | Bearer token |
| Report Failed Delivery | TBD | TBD | Report a delivery as failed with reason/notes | Bearer token |

### Expected Response Formats (TBD)

**Rider Profile:**
```json
{
  "id": "rider_123",
  "name": "John Kamau",
  "email": "john@example.com",
  "phone": "+254701234567",
  "availability": "available",
  "vehicleType": "motorcycle",
  "vehicleRegistration": "KRA-123A",
  "currentLocation": { "latitude": -1.2345, "longitude": 36.7890 },
  "joinedAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-08-27T14:30:00Z"
}
```

**Current Delivery:**
```json
{
  "id": "DL-1048",
  "customerId": "cust_456",
  "customerName": "Maya Okafor",
  "customerPhone": "+254702345678",
  "address": "18 Palm Avenue, Nairobi",
  "packageInfo": "Electronics - Headphones",
  "status": "accepted",
  "assignedAt": "2024-08-27T10:00:00Z"
}
```

**Delivery History (Array):**
```json
[
  {
    "id": "DL-1045",
    "customerId": "cust_123",
    "customerName": "Aisha Hassan",
    "address": "5 Ocean Road",
    "status": "delivered",
    "deliveredAt": "2024-08-27T12:00:00Z",
    "createdAt": "2024-08-27T08:00:00Z"
  },
  {
    "id": "DL-1046",
    "customerId": "cust_789",
    "customerName": "James Kipchoge",
    "address": "45 Mombasa Street",
    "status": "failed",
    "failureReason": "Customer not available",
    "createdAt": "2024-08-26T15:00:00Z"
  }
]
```

**Statistics:**
```json
{
  "active": 1,
  "completedToday": 5,
  "failedToday": 1,
  "total": 127
}
```

**Notifications (Array):**
```json
[
  {
    "id": "notif_001",
    "type": "delivery_assigned",
    "title": "New Delivery Assigned",
    "message": "You have been assigned delivery DL-1048",
    "deliveryId": "DL-1048",
    "read": false,
    "createdAt": "2024-08-27T14:00:00Z"
  },
  {
    "id": "notif_002",
    "type": "delivery_updated",
    "title": "Delivery Status Updated",
    "message": "Customer confirmed delivery DL-1045 has been received",
    "deliveryId": "DL-1045",
    "read": true,
    "createdAt": "2024-08-27T12:30:00Z"
  }
]
```

### Error Handling

All endpoints may return errors. Expected error format:

```json
{
  "status": 400,
  "message": "Invalid delivery status",
  "code": "INVALID_STATUS"
}
```

The frontend handles:
- **401 Unauthorized:** No token or invalid token
- **403 Forbidden:** Rider trying to access another rider's data
- **404 Not Found:** Delivery or profile not found
- **500 Server Error:** Backend service unavailable
- **Network Errors:** Connection failures (retry with user feedback)

### Notes for Backend Team

1. **Field Names:** The frontend uses camelCase for JavaScript consistency. If the backend returns snake_case, translate in `src/services/api.js`
2. **Empty Responses:** When a rider has no current delivery, return `null` or an empty result, not an error
3. **Status Values:** Use exact values: `assigned`, `accepted`, `picked_up`, `out_for_delivery`, `delivered`, `failed`
4. **Availability Values:** Use exact values: `available`, `busy`, `offline`
5. **Timestamps:** Use ISO 8601 format (e.g., `2024-08-27T14:30:00Z`)
6. **Endpoints:** Confirm all endpoint paths with frontend team before implementation
7. **Rate Limiting:** Consider rate limits for profile and stats endpoints (frequent polling)
8. **WebSockets:** If real-time updates are needed later, document event names and payload formats

---
>>>>>>> origin/rider
