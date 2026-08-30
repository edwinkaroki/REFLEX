from __future__ import annotations

from models import DEMO_LOCATION, DEMO_RIDER, Rider, RiderLocation
from schemas import (
    DeliveryStatusUpdate,
    QRScanRequest,
    RiderAvailabilityUpdate,
    RiderDeliveryItem,
    RiderLocationUpdate,
    RiderProfile,
    ScanResult,
)


DEMO_DELIVERY = RiderDeliveryItem(
    id="DEL-1001",
    customer_name="Maya Okafor",
    address="18 Palm Avenue",
    status="assigned",
    rider_id=DEMO_RIDER.id,
    pickup_name="Kisumu Hub",
    pickup_address="3 Market Road, Kisumu",
    package_info="Groceries order",
    customer_phone="+254712345678",
    distance="4.2 km",
)


def get_rider_profile(token: str) -> RiderProfile:
    """Fetch the authenticated rider's profile."""
    return RiderProfile(
        id=DEMO_RIDER.id,
        name=DEMO_RIDER.name,
        email=DEMO_RIDER.email,
        phone=DEMO_RIDER.phone,
        role=DEMO_RIDER.role,
        availability=DEMO_RIDER.availability,
        vehicle_type=DEMO_RIDER.vehicle_type,
        rating=DEMO_RIDER.rating,
    )


def update_rider_availability(
    token: str, payload: RiderAvailabilityUpdate
) -> RiderProfile:
    """Update the rider's availability status."""
    DEMO_RIDER.availability = payload.status
    return get_rider_profile(token)


def get_current_delivery(token: str) -> RiderDeliveryItem | None:
    """Get the rider's currently assigned delivery."""
    return DEMO_DELIVERY


def update_delivery_status(
    token: str, delivery_id: str, payload: DeliveryStatusUpdate
) -> RiderDeliveryItem:
    """Update the status of a delivery."""
    current = get_current_delivery(token)
    if current is None:
        raise ValueError("No active delivery")
    current.status = payload.status
    return current


def verify_qr_code(token: str, payload: QRScanRequest) -> ScanResult:
    """Verify a delivery QR code."""
    if payload.qrCode == "":
        raise ValueError("QR code is required")
    delivery_id = (
        payload.qrCode.split("|")[0]
        if "|" in payload.qrCode
        else payload.qrCode
    )
    return ScanResult(
        delivery_id=delivery_id,
        verified=True,
        message="QR code verified",
    )


def update_rider_location(
    token: str, payload: RiderLocationUpdate
) -> RiderLocation:
    """Update the rider's GPS location."""
    location = RiderLocation(
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy_meters=payload.accuracy_meters,
        updated_at="2026-08-29T08:00:00Z",
    )
    return location
