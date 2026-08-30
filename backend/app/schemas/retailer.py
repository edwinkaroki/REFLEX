
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RetailerProfileResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class RetailerProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None


