from dataclasses import dataclass


@dataclass
class Rider:
    """Minimal rider profile used by the rider persona contract."""

    id: str
    name: str
    email: str
    phone: str
    role: str = "rider"
    availability: str = "available"
    vehicle_type: str = "Bike"
    rating: float = 4.8


@dataclass
class RiderLocation:
    """Represents the rider's current GPS coordinates."""

    latitude: float
    longitude: float
    accuracy_meters: float | None = None
    updated_at: str | None = None


DEMO_RIDER = Rider(
    id="RID-1001",
    name="Amina Okafor",
    email="amina.okafor@reflex.local",
    phone="+254700123456",
    availability="available",
    vehicle_type="Bike",
    rating=4.8,
)


DEMO_LOCATION = RiderLocation(
    latitude=-1.286389,
    longitude=36.817223,
    accuracy_meters=12.5,
    updated_at="2026-08-29T08:00:00Z",
)
