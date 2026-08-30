from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentStatusUpdate,
)
from app.services.assignment import (
    create_assignment,
    update_assignment_status,
)

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


@router.post("", response_model=AssignmentResponse, status_code=201)
def create_new_assignment(
    data: AssignmentCreate,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    return create_assignment(db, data)


@router.patch("/{assignment_id}", response_model=AssignmentResponse)
def change_assignment_status(
    assignment_id: UUID,
    data: AssignmentStatusUpdate,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    return update_assignment_status(db, assignment_id, data)