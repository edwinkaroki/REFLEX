from fastapi import APIRouter, HTTPException, status

from schemas import (
    DeliveryStatusUpdate,
    QRScanRequest,
    RiderAvailabilityUpdate,
    RiderLocationUpdate,
)
from services import (
    get_current_delivery,
    get_rider_profile,
    update_delivery_status,
    update_rider_availability,
    update_rider_location,
    verify_qr_code,
)

router = APIRouter()


def get_token(authorization: str | None = None) -> str:
    """Extract and validate bearer token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
        )
    return authorization.removeprefix("Bearer ").strip()


@router.get("/profile")
def get_profile(authorization: str | None = None):
    """Get the authenticated rider's profile."""
    token = get_token(authorization)
    return get_rider_profile(token).model_dump()


@router.post("/availability")
def update_availability(
    payload: RiderAvailabilityUpdate,
    authorization: str | None = None,
):
    """Update rider's availability status (available, busy, or offline)."""
    token = get_token(authorization)
    return update_rider_availability(token, payload).model_dump()


@router.get("/current-delivery")
def current_delivery(authorization: str | None = None):
    """Get the rider's currently assigned delivery."""
    token = get_token(authorization)
    delivery = get_current_delivery(token)
    if delivery is None:
        return None
    return delivery.model_dump()


@router.post("/delivery/{delivery_id}/status")
def set_delivery_status(
    delivery_id: str,
    payload: DeliveryStatusUpdate,
    authorization: str | None = None,
):
    """Update the status of a delivery (pending, assigned, picked_up, in_transit, delivered, cancelled)."""
    token = get_token(authorization)
    try:
        result = update_delivery_status(token, delivery_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    return result.model_dump()


@router.post("/scan-qr")
def scan_qr(
    payload: QRScanRequest,
    authorization: str | None = None,
):
    """Verify a delivery QR code scan."""
    token = get_token(authorization)
    try:
        result = verify_qr_code(token, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return result.model_dump()


@router.post("/location")
def set_location(
    payload: RiderLocationUpdate,
    authorization: str | None = None,
):
    """Update the rider's GPS location."""
    token = get_token(authorization)
    return update_rider_location(token, payload).__dict__