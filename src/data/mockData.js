const DEFAULT_DELIVERIES = [
  {
    id: "7777-demo",
    pickup_address: "Westlands, Nairobi",
    dropoff_address: "Kilimani, Nairobi",
    status: "pending",
    created_at: "2026-08-27T10:00:00Z",
    updated_at: "2026-08-27T10:00:00Z",
    customer_name: "Maya Okafor",
    address: "Kilimani, Nairobi",
    customer_phone: "+254700000000",
    package: "Parcel delivery",
    retailer_name: "Demo Retailer",
    rider_id: null,
  },
];

export function getStoredDeliveries() {
  const stored = localStorage.getItem("reflex:deliveries");

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_DELIVERIES;
    }
  }

  return DEFAULT_DELIVERIES;
}

export function saveStoredDeliveries(deliveries) {
  localStorage.setItem("reflex:deliveries", JSON.stringify(deliveries));
}

export const mockRiders = [
  {
    id: "5555-demo",
    name: "Rider One",
    status: "available",
    vehicle_type: "motorbike",
    location: "Westlands",
    active_delivery_id: null,
    distance_minutes: 5,
    phone: "+254700000001",
  },
];