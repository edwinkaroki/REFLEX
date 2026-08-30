 
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.retailer import RetailerProfileUpdate


def get_retailer_profile(
    db: Session,
    retailer_id: UUID,
) -> User:
    retailer = (
        db.query(User)
        .filter(
            User.id == retailer_id,
            User.role == UserRole.retailer,
        )
        .first()
    )

    if not retailer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Retailer not found",
        )

    return retailer


def update_retailer_profile(
    db: Session,
    retailer_id: UUID,
    data: RetailerProfileUpdate,
) -> User:
    retailer = get_retailer_profile(db, retailer_id)

    if data.name is not None:
        retailer.name = data.name

    if data.email is not None:
        existing_user = (
            db.query(User)
            .filter(
                User.email == data.email,
                User.id != retailer_id,
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already in use",
            )

        retailer.email = data.email

    db.commit()
    db.refresh(retailer)

    return retailer

