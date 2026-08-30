from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.retailer import (
    RetailerProfileResponse,
    RetailerProfileUpdate,
)
from app.services.retailer import (
    get_retailer_profile,
    update_retailer_profile,
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


@router.get("/profile", response_model=RetailerProfileResponse)
def get_profile(
    current_user: User = Depends(require_retailer),
    db: Session = Depends(get_db),
):
    return get_retailer_profile(
        db=db,
        retailer_id=current_user.id,
    )


@router.patch("/profile", response_model=RetailerProfileResponse)
def update_profile(
    data: RetailerProfileUpdate,
    current_user: User = Depends(require_retailer),
    db: Session = Depends(get_db),
):
    return update_retailer_profile(
        db=db,
        retailer_id=current_user.id,
        data=data,
    )