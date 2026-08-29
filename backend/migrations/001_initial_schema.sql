CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('rider', 'retailer', 'dispatcher', 'admin');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TYPE rider_status AS ENUM ('available', 'busy', 'offline');

CREATE TABLE riders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id),
    phone           VARCHAR(20) NOT NULL,
    vehicle_type    VARCHAR(50),
    status          rider_status NOT NULL DEFAULT 'offline',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE delivery_status AS ENUM (
    'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'
);

CREATE TABLE deliveries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id         UUID NOT NULL REFERENCES users(id),
    pickup_address      TEXT NOT NULL,
    dropoff_address     TEXT NOT NULL,
    status              delivery_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_retailer ON deliveries(retailer_id);

CREATE TABLE rider_locations (
    id              SERIAL PRIMARY KEY,
    rider_id        UUID NOT NULL REFERENCES riders(id),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    recorded_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rider_locations_rider ON rider_locations(rider_id);
CREATE INDEX idx_rider_locations_recorded ON rider_locations(recorded_at);

CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'rejected', 'completed');

CREATE TABLE assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id     UUID NOT NULL UNIQUE REFERENCES deliveries(id),
    rider_id        UUID NOT NULL REFERENCES riders(id),
    status          assignment_status NOT NULL DEFAULT 'assigned',
    assigned_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_rider ON assignments(rider_id);

CREATE TABLE delivery_events (
    id              SERIAL PRIMARY KEY,
    delivery_id     UUID NOT NULL REFERENCES deliveries(id),
    event_type      VARCHAR(50) NOT NULL,
    payload         JSONB,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_events_delivery ON delivery_events(delivery_id);
CREATE INDEX idx_delivery_events_created ON delivery_events(created_at);
