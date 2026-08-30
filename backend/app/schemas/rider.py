from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RiderProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    phone: str
    role: str
    availability: str
    vehicleType: str | None = None
    vehicle_type: str | None = None
    rating: float = 4.8


class RiderAvailabilityUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(available|busy|offline)$")


class RiderDeliveryStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern=r"^(pending|assigned|accepted|picked_up|out_for_delivery|delivered|failed|cancelled)$",
    )


class RiderDeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    retailer_id: UUID | None = None
    pickup_address: str | None = None
    dropoff_address: str | None = None
    status: str
    pickupName: str | None = None
    pickupAddress: str | None = None
    customerName: str | None = None
    address: str | None = None
    packageInfo: str | None = None
    customerPhone: str | None = None
    distance: str | None = None
    rider_id: UUID | None = None


class QRScanRequest(BaseModel):
    qrCode: str


class QRScanResult(BaseModel):
    delivery_id: str
    verified: bool = True
    message: str = "QR code verified"


class RiderLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: float | None = None


class RiderLocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    rider_id: UUID
    latitude: float
    longitude: float
    recorded_at: str | None = None


class RiderNotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: str
    message: str
    read: bool
    created_at: str
