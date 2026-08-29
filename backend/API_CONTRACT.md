# REST API Contract
Delivery Platform — Backend Layer (FastAPI)
Base URL (local dev): http://localhost:8000/api

## Auth
POST /auth/login -> { access_token, role, user_id }

## Retailer (Person C)
POST /deliveries -> creates a delivery
GET /deliveries?retailer_id=&status= -> list/history
GET /deliveries/{id} -> single delivery detail + rider + current location

## Dispatcher (Person C)
GET /deliveries?status=pending -> unassigned deliveries
GET /riders?status=available -> free riders
POST /assignments -> { delivery_id, rider_id }
PATCH /assignments/{id} -> { status }

## Rider (Person B)
GET /deliveries/{id} -> current job detail
PATCH /deliveries/{id}/status -> { status }
POST /deliveries/{id}/proof -> multipart file upload
POST /riders/{id}/location -> { latitude, longitude }

## WebSocket (Person D)
Connect: ws://localhost:8000/ws?token={jwt}
Envelope: { "event": "...", "data": {...} }

| Event | Fired when | Listeners |
|---|---|---|
| delivery_status_changed | status update | Retailer, Dispatcher |
| rider_location_updated | new GPS ping | Dispatcher |
| delivery_assigned | dispatcher assigns rider | Rider, Retailer |
| proof_uploaded | rider uploads proof | Retailer |

## Rules
1. Timestamps: ISO 8601 UTC strings.
2. IDs: UUID strings in all request/response bodies.
3. Status transitions enforced server-side — frontend just handles error responses.
4. All state-changing requests require Authorization: Bearer {jwt}.
