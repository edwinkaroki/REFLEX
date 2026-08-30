from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.assignment import AssignmentStatus


class AssignmentCreate(BaseModel):
    delivery_id: UUID
    rider_id: UUID


class AssignmentStatusUpdate(BaseModel):
    status: AssignmentStatus


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    delivery_id: UUID
    rider_id: UUID
    status: AssignmentStatus
