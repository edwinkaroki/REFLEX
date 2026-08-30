
import enum
from datetime import datetime
from sqlalchemy import Column, Text, DateTime, Enum, ForeignKey, String, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.db.database import Base


class DeliveryStatus(str, enum.Enum):
    pending = "pending"
    assigned = "assigned"
    picked_up = "picked_up"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    retailer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    pickup_address = Column(Text, nullable=False)
    dropoff_address = Column(Text, nullable=False)
    status = Column(
        Enum(DeliveryStatus),
        default=DeliveryStatus.pending,
        nullable=False,
        index=True,
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    retailer = relationship(
        "User",
        back_populates="deliveries_created",
    )

    assignment = relationship(
        "Assignment",
        back_populates="delivery",
        uselist=False,
    )

    events = relationship(
        "DeliveryEvent",
        back_populates="delivery",
    )


class DeliveryEvent(Base):
    __tablename__ = "delivery_events"

    # PostgreSQL already has this as an auto-incrementing integer.
    id = Column(
        # Integer is intentionally used because the existing DB column is integer.
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    delivery_id = Column(
        UUID(as_uuid=True),
        ForeignKey("deliveries.id"),
        nullable=False,
        index=True,
    )

    event_type = Column(
        String(50),
        nullable=False,
    )

    payload = Column(
        JSONB,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    delivery = relationship(
        "Delivery",
        back_populates="events",
    )
