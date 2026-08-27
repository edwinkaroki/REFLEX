 
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