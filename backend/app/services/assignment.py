
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.assignment import Assignment, AssignmentStatus
from app.models.delivery import Delivery, DeliveryEvent, DeliveryStatus
from app.models.rider import Rider, RiderStatus
from app.schemas.assignment import AssignmentCreate, AssignmentStatusUpdate


def create_assignment(
    db: Session,
    data: AssignmentCreate,
) -> Assignment:
    # Check that the delivery exists.
    delivery = (
        db.query(Delivery)
        .filter(Delivery.id == data.delivery_id)
        .first()
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    # A delivery can only have one assignment.
    existing_assignment = (
        db.query(Assignment)
        .filter(Assignment.delivery_id == data.delivery_id)
        .first()
    )

    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivery is already assigned",
        )

    # Check that the rider exists.
    rider = (
        db.query(Rider)
        .filter(Rider.id == data.rider_id)
        .first()
    )

    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider not found",
        )

    # Only available riders can receive a new assignment.
    if rider.status != RiderStatus.available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Rider is not available",
        )

    # A new assignment should only be made to a pending delivery.
    if delivery.status != DeliveryStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivery is not pending",
        )

    assignment = Assignment(
        delivery_id=delivery.id,
        rider_id=rider.id,
        status=AssignmentStatus.assigned,
    )

    # Update related state.
    delivery.status = DeliveryStatus.assigned
    rider.status = RiderStatus.busy

    # Add assignment first so SQLAlchemy generates its ID.
    db.add(assignment)
    db.flush()

    # Record the assignment event.
    event = DeliveryEvent(
        delivery_id=delivery.id,
        event_type="delivery_assigned",
        payload={
            "delivery_id": str(delivery.id),
            "rider_id": str(rider.id),
            "assignment_id": str(assignment.id),
        },
    )

    db.add(event)

    db.commit()
    db.refresh(assignment)

    return assignment


def update_assignment_status(
    db: Session,
    assignment_id: UUID,
    data: AssignmentStatusUpdate,
) -> Assignment:
    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        )

    current_status = assignment.status
    new_status = data.status

    # Valid assignment status transitions.
    valid_transitions = {
        AssignmentStatus.assigned: {
            AssignmentStatus.accepted,
            AssignmentStatus.rejected,
        },
        AssignmentStatus.accepted: {
            AssignmentStatus.completed,
        },
        AssignmentStatus.rejected: set(),
        AssignmentStatus.completed: set(),
    }

    if new_status == current_status:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Assignment is already {current_status.value}",
        )

    if new_status not in valid_transitions.get(current_status, set()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Invalid assignment status transition: "
                f"{current_status.value} -> {new_status.value}"
            ),
        )

    assignment.status = new_status

    # Update related delivery/rider state.
    delivery = assignment.delivery
    rider = assignment.rider

    if new_status == AssignmentStatus.accepted:
        delivery.status = DeliveryStatus.assigned

    elif new_status == AssignmentStatus.rejected:
        delivery.status = DeliveryStatus.pending
        rider.status = RiderStatus.available

    elif new_status == AssignmentStatus.completed:
        delivery.status = DeliveryStatus.delivered
        rider.status = RiderStatus.available

    # Record the status-change event.
    event = DeliveryEvent(
        delivery_id=assignment.delivery_id,
        event_type="assignment_status_changed",
        payload={
            "assignment_id": str(assignment.id),
            "delivery_id": str(assignment.delivery_id),
            "rider_id": str(assignment.rider_id),
            "from": current_status.value,
            "to": new_status.value,
        },
    )

    db.add(event)
    db.commit()
    db.refresh(assignment)

    return assignment

