from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.rider import (
    QRScanRequest,
    QRScanResult,
    RiderAvailabilityUpdate,
    RiderDeliveryResponse,
    RiderDeliveryStatusUpdate,
    RiderLocationResponse,
    RiderLocationUpdate,
    RiderNotificationResponse,
    RiderProfileResponse,
)
from app.services.rider import (
    add_rider_location,
    get_current_delivery_for_rider,
    get_rider_deliveries,
    get_rider_notifications,
    get_rider_profile,
    get_rider_stats,
    update_rider_availability,
    update_rider_delivery_status,
    verify_qr_code,
)

router = APIRouter()


@router.get("/profile", response_model=RiderProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_rider_profile(db, current_user)


@router.post("/availability", response_model=RiderProfileResponse)
def update_availability(
    data: RiderAvailabilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return update_rider_availability(db, current_user, data.status)


@router.get("/current-delivery", response_model=RiderDeliveryResponse | None)
def get_current_delivery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    delivery = get_current_delivery_for_rider(db, current_user)
    if delivery is None:
        return None
    return delivery


@router.get("/deliveries", response_model=list[RiderDeliveryResponse])
def list_deliveries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return get_rider_deliveries(db, current_user)


@router.post("/delivery/{delivery_id}/status", response_model=RiderDeliveryResponse)
def update_delivery_status(
    delivery_id: UUID,
    data: RiderDeliveryStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return update_rider_delivery_status(db, current_user, delivery_id, data.status)


@router.post("/scan-qr", response_model=QRScanResult)
def scan_qr(
    data: QRScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return verify_qr_code(db, current_user, data.qrCode)


@router.post("/location", response_model=RiderLocationResponse)
def set_location(
    data: RiderLocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return add_rider_location(
        db,
        current_user,
        latitude=data.latitude,
        longitude=data.longitude,
        accuracy_meters=data.accuracy_meters,
    )


@router.get("/notifications", response_model=list[RiderNotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return get_rider_notifications(db, current_user)


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "rider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rider access required",
        )
    return get_rider_stats(db, current_user)
