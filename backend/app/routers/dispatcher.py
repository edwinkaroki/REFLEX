from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.delivery import Delivery, DeliveryStatus
from app.models.rider import Rider, RiderStatus
from app.models.user import User, UserRole
from app.schemas.delivery import DeliveryResponse

router = APIRouter()


def require_dispatcher(
    user: User = Depends(get_current_user),
) -> User:
    if user.role not in {UserRole.dispatcher, UserRole.admin}:
        raise HTTPException(
            status_code=403,
            detail="Dispatcher access required",
        )

    return user


@router.get("/deliveries", response_model=list[DeliveryResponse])
def get_dispatcher_deliveries(
    status: DeliveryStatus | None = Query(default=None),
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    query = db.query(Delivery)

    if status is not None:
        query = query.filter(Delivery.status == status)

    return query.order_by(Delivery.created_at.desc()).all()


@router.get("/deliveries/{delivery_id}", response_model=DeliveryResponse)
def get_dispatcher_delivery(
    delivery_id: UUID,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

    if not delivery:
        raise HTTPException(
            status_code=404,
            detail="Delivery not found",
        )

    return delivery


@router.get("/riders")
def get_dispatcher_riders(
    status: RiderStatus | None = Query(default=None),
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    query = db.query(Rider)

    if status is not None:
        query = query.filter(Rider.status == status)

    return query.all()