from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.delivery import DeliveryStatus


class DeliveryCreate(BaseModel):
    pickup_address: str
    dropoff_address: str


class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus


class DeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    retailer_id: UUID
    pickup_address: str
    dropoff_address: str
    status: DeliveryStatus
    created_at: datetime
    updated_at: datetime
