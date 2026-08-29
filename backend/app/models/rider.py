import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class RiderStatus(str, enum.Enum):
    available = "available"
    busy = "busy"
    offline = "offline"


class Rider(Base):
    __tablename__ = "riders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    phone = Column(String(20), nullable=False)
    vehicle_type = Column(String(50), nullable=True)
    status = Column(Enum(RiderStatus), default=RiderStatus.offline, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="rider_profile")
    locations = relationship("RiderLocation", back_populates="rider")
    assignments = relationship("Assignment", back_populates="rider")
