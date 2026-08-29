# Database Schema Reference
Delivery Platform — Database Layer (PostgreSQL)
Owner: Person A (db-connection branch)

Seven tables. Read top to bottom — later tables reference earlier ones.

---

## 1. users
Root table. Every account — retailer, rider, dispatcher, admin — lives here.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | auto-generated |
| name | varchar(120) | required |
| email | varchar(255) | required, unique, indexed |
| password_hash | varchar(255) | required |
| role | enum | rider, retailer, dispatcher, admin |
| created_at | timestamp | auto-set |

## 2. riders
One-to-one extension of users where role = rider.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | auto-generated |
| user_id | UUID (FK -> users.id) | required, unique |
| phone | varchar(20) | required |
| vehicle_type | varchar(50) | optional |
| status | enum | available, busy, offline |
| created_at | timestamp | auto-set |

## 3. deliveries
Central table, created by a retailer.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | auto-generated |
| retailer_id | UUID (FK -> users.id) | required |
| pickup_address | text | required |
| dropoff_address | text | required |
| status | enum | pending, assigned, picked_up, in_transit, delivered, cancelled |
| created_at | timestamp | auto-set |
| updated_at | timestamp | auto-updates |

## 4. rider_locations
High-write table. GPS pings.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | auto-increment |
| rider_id | UUID (FK -> riders.id) | required, indexed |
| latitude | double precision | required |
| longitude | double precision | required |
| recorded_at | timestamp | auto-set, indexed |

## 5. assignments
Links one delivery to one rider.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | auto-generated |
| delivery_id | UUID (FK -> deliveries.id) | required, unique |
| rider_id | UUID (FK -> riders.id) | required |
| status | enum | assigned, accepted, rejected, completed |
| assigned_at | timestamp | auto-set |

## 6. delivery_events
Append-only history log.

| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | auto-increment |
| delivery_id | UUID (FK -> deliveries.id) | required, indexed |
| event_type | varchar(50) | e.g. status_changed, proof_uploaded |
| payload | jsonb | flexible |
| created_at | timestamp | auto-set, indexed |

## 7. notifications
Per-user notification log, feeds the WebSocket layer.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | auto-generated |
| user_id | UUID (FK -> users.id) | required, indexed |
| type | enum | delivery_assigned, status_changed, proof_uploaded |
| message | varchar(255) | required |
| read | boolean | default false |
| created_at | timestamp | auto-set, indexed |

---

## Who writes to what

| Table | Written by |
|---|---|
| users | Auth (Person A) |
| riders | Auth, on rider signup |
| deliveries | Retailer Dashboard (Person C) |
| assignments | Dispatcher Dashboard (Person C) |
| rider_locations | Rider Interface (Person B) |
| delivery_events | Backend, automatically |
| notifications | WebSocket layer (Person D) |
