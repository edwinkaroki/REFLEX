from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.delivery import Delivery, DeliveryStatus
from app.models.user import User, UserRole
from app.schemas.delivery import DeliveryCreate, DeliveryResponse
from app.services.delivery import (
    create_delivery,
    get_delivery,
    get_retailer_delivery,
    get_retailer_deliveries,
)

router = APIRouter()


def require_retailer(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != UserRole.retailer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Retailer access required",
        )

    return user


def require_dispatcher(
    user: User = Depends(get_current_user),
) -> User:
    if user.role not in {UserRole.dispatcher, UserRole.admin}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dispatcher access required",
        )

    return user


@router.get("", response_model=list[DeliveryResponse])
def list_deliveries_for_dispatcher(
    status: DeliveryStatus | None = Query(default=None),
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    query = db.query(Delivery)

    if status is not None:
        query = query.filter(Delivery.status == status)

    return query.order_by(Delivery.created_at.desc()).all()


@router.post("", response_model=DeliveryResponse)
def create_new_delivery(
    data: DeliveryCreate,
    current_user: User = Depends(require_retailer),
    db: Session = Depends(get_db),
):
    return create_delivery(
        db=db,
        retailer_id=current_user.id,
        data=data,
    )


@router.get("/my", response_model=list[DeliveryResponse])
def get_my_deliveries(
    current_user: User = Depends(require_retailer),
    db: Session = Depends(get_db),
):
    return get_retailer_deliveries(
        db=db,
        retailer_id=current_user.id,
    )


@router.get("/{delivery_id}", response_model=DeliveryResponse)
def get_delivery_detail(
    delivery_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delivery = get_delivery(db, delivery_id)

    if current_user.role == UserRole.retailer:
        if delivery.retailer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this delivery",
            )
        return delivery

    if current_user.role in {UserRole.dispatcher, UserRole.admin}:
        return delivery

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied",
    )