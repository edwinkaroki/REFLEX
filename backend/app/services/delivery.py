from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.delivery import Delivery, DeliveryStatus
from app.schemas.delivery import DeliveryCreate


def create_delivery(
    db: Session,
    retailer_id: UUID,
    data: DeliveryCreate,
) -> Delivery:
    delivery = Delivery(
        retailer_id=retailer_id,
        pickup_address=data.pickup_address,
        dropoff_address=data.dropoff_address,
        status=DeliveryStatus.pending,
    )

    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    return delivery


def get_retailer_deliveries(
    db: Session,
    retailer_id: UUID,
) -> list[Delivery]:
    return (
        db.query(Delivery)
        .filter(Delivery.retailer_id == retailer_id)
        .order_by(Delivery.created_at.desc())
        .all()
    )


def get_delivery(
    db: Session,
    delivery_id: UUID,
) -> Delivery:
    delivery = (
        db.query(Delivery)
        .filter(Delivery.id == delivery_id)
        .first()
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    return delivery


def get_retailer_delivery(
    db: Session,
    delivery_id: UUID,
    retailer_id: UUID,
) -> Delivery:
    delivery = (
        db.query(Delivery)
        .filter(
            Delivery.id == delivery_id,
            Delivery.retailer_id == retailer_id,
        )
        .first()
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    return delivery