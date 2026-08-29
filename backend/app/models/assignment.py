import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class AssignmentStatus(str, enum.Enum):
    assigned = "assigned"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delivery_id = Column(UUID(as_uuid=True), ForeignKey("deliveries.id"), nullable=False, unique=True)
    rider_id = Column(UUID(as_uuid=True), ForeignKey("riders.id"), nullable=False)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.assigned, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    delivery = relationship("Delivery", back_populates="assignment")
    rider = relationship("Rider", back_populates="assignments")
