INSERT INTO users (id, name, email, password_hash, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Jane Retailer', 'jane@retailer.com', 'hashed_pw', 'retailer'),
    ('22222222-2222-2222-2222-222222222222', 'Dan Dispatcher', 'dan@dispatch.com', 'hashed_pw', 'dispatcher'),
    ('33333333-3333-3333-3333-333333333333', 'Rider One', 'rider1@fleet.com', 'hashed_pw', 'rider'),
    ('44444444-4444-4444-4444-444444444444', 'Rider Two', 'rider2@fleet.com', 'hashed_pw', 'rider');

INSERT INTO riders (id, user_id, phone, vehicle_type, status) VALUES
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '+254700000001', 'motorbike', 'available'),
    ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '+254700000002', 'bicycle', 'offline');

INSERT INTO deliveries (id, retailer_id, pickup_address, dropoff_address, status) VALUES
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Westlands, Nairobi', 'Kilimani, Nairobi', 'assigned'),
    ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'CBD, Nairobi', 'Karen, Nairobi', 'pending');

INSERT INTO assignments (delivery_id, rider_id, status) VALUES
    ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'accepted');

INSERT INTO rider_locations (rider_id, latitude, longitude) VALUES
    ('55555555-5555-5555-5555-555555555555', -1.2833, 36.8172),
    ('55555555-5555-5555-5555-555555555555', -1.2841, 36.8180);

INSERT INTO delivery_events (delivery_id, event_type, payload) VALUES
    ('77777777-7777-7777-7777-777777777777', 'status_changed', '{"from": "pending", "to": "assigned"}'),
    ('77777777-7777-7777-7777-777777777777', 'status_changed', '{"from": "assigned", "to": "picked_up"}');
