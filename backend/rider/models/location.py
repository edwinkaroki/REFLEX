from dataclasses import dataclass


@dataclass
class RiderLocation:
    """Represents the rider's current GPS coordinates."""

    latitude: float
    longitude: float
    accuracy_meters: float | None = None
    updated_at: str | None = None


DEMO_LOCATION = RiderLocation(
    latitude=-1.286389,
    longitude=36.817223,
    accuracy_meters=12.5,
    updated_at="2026-08-29T08:00:00Z",
)
