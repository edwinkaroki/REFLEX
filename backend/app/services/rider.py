from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.delivery import Delivery, DeliveryEvent, DeliveryStatus
from app.models.location import RiderLocation
from app.models.notification import Notification
from app.models.rider import Rider, RiderStatus
from app.models.user import User
from app.websocket.events import emit_delivery_status_changed, emit_rider_availability_updated


def _get_rider_for_user(db: Session, user: User) -> Rider:
    rider = (
        db.query(Rider)
        .filter(Rider.user_id == user.id)
        .first()
    )

    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider profile not found",
        )

    return rider


def _normalize_rider_status(value: str) -> RiderStatus:
    try:
        return RiderStatus(value)
    except ValueError as exc:
        allowed = ", ".join(status.value for status in RiderStatus)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid rider status. Allowed values: {allowed}",
        ) from exc


def _normalize_delivery_status(value: str) -> str:
    aliases = {
        "assigned": "assigned",
        "accepted": "assigned",
        "picked_up": "picked_up",
        "out_for_delivery": "in_transit",
        "delivered": "delivered",
        "failed": "cancelled",
        "cancelled": "cancelled",
        "pending": "pending",
    }

    if value not in aliases:
        allowed = [
            "pending",
            "assigned",
            "accepted",
            "picked_up",
            "out_for_delivery",
            "delivered",
            "failed",
            "cancelled",
        ]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid delivery status. Allowed values: {', '.join(allowed)}",
        )

    return aliases[value]


def _serialize_rider_profile(db: Session, user: User, rider: Rider) -> dict:
    return {
        "id": rider.id,
        "name": user.name,
        "email": user.email,
        "phone": rider.phone,
        "role": user.role.value,
        "availability": rider.status.value,
        "vehicleType": rider.vehicle_type,
        "vehicle_type": rider.vehicle_type,
        "rating": 4.8,
    }


def get_rider_profile(db: Session, current_user: User) -> dict:
    rider = _get_rider_for_user(db, current_user)
    return _serialize_rider_profile(db, current_user, rider)


def update_rider_availability(
    db: Session,
    current_user: User,
    value: str,
) -> dict:
    rider = _get_rider_for_user(db, current_user)
    rider.status = _normalize_rider_status(value)
    db.commit()
    db.refresh(rider)

    emit_rider_availability_updated(
        rider_user_id=str(current_user.id),
        rider_id=str(rider.id),
        status=rider.status.value,
    )

    return _serialize_rider_profile(db, current_user, rider)


def _get_assignment_for_rider_and_delivery(
    db: Session,
    rider_id: UUID,
    delivery_id: UUID,
) -> Assignment | None:
    return (
        db.query(Assignment)
        .filter(
            Assignment.rider_id == rider_id,
            Assignment.delivery_id == delivery_id,
        )
        .first()
    )


def _get_latest_active_assignment(db: Session, rider_id: UUID) -> Assignment | None:
    return (
        db.query(Assignment)
        .filter(Assignment.rider_id == rider_id)
        .join(Delivery, Delivery.id == Assignment.delivery_id)
        .filter(
            Delivery.status != DeliveryStatus.delivered,
            Delivery.status != DeliveryStatus.cancelled,
        )
        .order_by(Assignment.assigned_at.desc())
        .first()
    )


def _serialize_delivery_for_rider(db: Session, delivery: Delivery, rider: Rider) -> dict:
    retailer = db.query(User).filter(User.id == delivery.retailer_id).first()
    return {
        "id": delivery.id,
        "retailer_id": delivery.retailer_id,
        "pickup_address": delivery.pickup_address,
        "dropoff_address": delivery.dropoff_address,
        "status": delivery.status.value,
        "pickupName": retailer.name if retailer else "Pickup point",
        "pickupAddress": delivery.pickup_address,
        "customerName": retailer.name if retailer else "Customer",
        "address": delivery.dropoff_address,
        "packageInfo": "Delivery order",
        "customerPhone": None,
        "distance": "0.0 km",
        "rider_id": rider.id,
    }


def get_current_delivery_for_rider(db: Session, current_user: User) -> dict | None:
    rider = _get_rider_for_user(db, current_user)
    assignment = _get_latest_active_assignment(db, rider.id)

    if not assignment:
        return None

    delivery = db.query(Delivery).filter(Delivery.id == assignment.delivery_id).first()
    if not delivery:
        return None

    return _serialize_delivery_for_rider(db, delivery, rider)


def get_rider_deliveries(db: Session, current_user: User) -> list[dict]:
    rider = _get_rider_for_user(db, current_user)
    assignments = (
        db.query(Assignment)
        .filter(Assignment.rider_id == rider.id)
        .order_by(Assignment.assigned_at.desc())
        .all()
    )

    deliveries: list[dict] = []
    for assignment in assignments:
        delivery = db.query(Delivery).filter(Delivery.id == assignment.delivery_id).first()
        if delivery is not None:
            deliveries.append(_serialize_delivery_for_rider(db, delivery, rider))

    return deliveries


def update_rider_delivery_status(
    db: Session,
    current_user: User,
    delivery_id: UUID,
    new_status: str,
) -> dict:
    rider = _get_rider_for_user(db, current_user)

    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    assignment = _get_assignment_for_rider_and_delivery(db, rider.id, delivery.id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This rider is not assigned to this delivery",
        )

    previous_status = delivery.status.value
    db_status = _normalize_delivery_status(new_status)

    if new_status == "accepted":
        assignment.status = AssignmentStatus.accepted
        delivery.status = DeliveryStatus.assigned
        rider.status = RiderStatus.busy
    elif new_status == "picked_up":
        delivery.status = DeliveryStatus.picked_up
        assignment.status = AssignmentStatus.accepted
    elif new_status == "out_for_delivery":
        delivery.status = DeliveryStatus.in_transit
        assignment.status = AssignmentStatus.accepted
    elif new_status == "delivered":
        delivery.status = DeliveryStatus.delivered
        assignment.status = AssignmentStatus.completed
        rider.status = RiderStatus.available
    elif new_status == "failed":
        delivery.status = DeliveryStatus.cancelled
        assignment.status = AssignmentStatus.completed
        rider.status = RiderStatus.available
    elif new_status == "cancelled":
        delivery.status = DeliveryStatus.cancelled
        assignment.status = AssignmentStatus.rejected
        rider.status = RiderStatus.available
    elif new_status == "assigned":
        delivery.status = DeliveryStatus.assigned
        assignment.status = AssignmentStatus.assigned
    elif new_status == "pending":
        delivery.status = DeliveryStatus.pending
        assignment.status = AssignmentStatus.assigned

    event = DeliveryEvent(
        delivery_id=delivery.id,
        event_type="status_changed",
        payload={
            "from": previous_status,
            "to": new_status,
            "rider_id": str(rider.id),
            "delivery_id": str(delivery.id),
            "database_status": db_status,
        },
    )
    db.add(event)
    db.commit()
    db.refresh(delivery)
    db.refresh(assignment)
    db.refresh(rider)

    emit_delivery_status_changed(
        delivery_id=str(delivery.id),
        rider_id=str(rider.id),
        retailer_id=str(delivery.retailer_id),
        payload={
            "from": previous_status,
            "to": new_status,
            "status": new_status,
            "rider_id": str(rider.id),
            "assignment_id": str(assignment.id),
        },
    )

    if rider.status.value in {"available", "busy", "offline"}:
        emit_rider_availability_updated(
            rider_user_id=str(current_user.id),
            rider_id=str(rider.id),
            status=rider.status.value,
        )

    return _serialize_delivery_for_rider(db, delivery, rider)


def verify_qr_code(db: Session, current_user: User, qr_code: str) -> dict:
    if not qr_code or not qr_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR code is required",
        )

    delivery_id = qr_code.split("|")[0] if "|" in qr_code else qr_code

    try:
        parsed = UUID(delivery_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid QR code format",
        ) from exc

    delivery = db.query(Delivery).filter(Delivery.id == parsed).first()
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found for QR code",
        )

    return {
        "delivery_id": str(delivery.id),
        "verified": True,
        "message": "QR code verified",
    }


def add_rider_location(
    db: Session,
    current_user: User,
    latitude: float,
    longitude: float,
    accuracy_meters: float | None,
) -> dict:
    rider = _get_rider_for_user(db, current_user)
    location = RiderLocation(
        rider_id=rider.id,
        latitude=latitude,
        longitude=longitude,
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return {
        "id": location.id,
        "rider_id": rider.id,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "recorded_at": location.recorded_at.isoformat(),
    }


def get_rider_notifications(db: Session, current_user: User) -> list[dict]:
    rows = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "type": row.type.value,
            "message": row.message,
            "read": row.read,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]


def get_rider_stats(db: Session, current_user: User) -> dict:
    rider = _get_rider_for_user(db, current_user)
    active_assignments = (
        db.query(Assignment)
        .filter(Assignment.rider_id == rider.id)
        .join(Delivery, Delivery.id == Assignment.delivery_id)
        .filter(
            Delivery.status.in_(
                [
                    DeliveryStatus.assigned,
                    DeliveryStatus.picked_up,
                    DeliveryStatus.in_transit,
                ]
            )
        )
        .count()
    )

    completed_today = (
        db.query(Assignment)
        .filter(Assignment.rider_id == rider.id)
        .join(Delivery, Delivery.id == Assignment.delivery_id)
        .filter(Delivery.status == DeliveryStatus.delivered)
        .count()
    )

    return {
        "active": active_assignments,
        "completedToday": completed_today,
        "earnings": 0,
        "availability": rider.status.value,
    }
