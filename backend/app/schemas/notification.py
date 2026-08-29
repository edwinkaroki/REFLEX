"""Notification schemas boundary."""
import uuid
from datetime import datetime
from pydantic import BaseModel

class NotificationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True
