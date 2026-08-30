from pydantic import BaseModel, Field


class RiderProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str = "rider"
    availability: str = Field(..., pattern=r"^(available|busy|offline)$")
    vehicle_type: str
    rating: float


class RiderAvailabilityUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(available|busy|offline)$")


class DeliveryStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern=r"^(pending|assigned|picked_up|in_transit|delivered|cancelled)$",
    )


class QRScanRequest(BaseModel):
    qrCode: str


class RiderDeliveryItem(BaseModel):
    id: str
    customer_name: str
    address: str
    status: str
    rider_id: str | None = None
    pickup_name: str | None = None
    pickup_address: str | None = None
    package_info: str | None = None
    customer_phone: str | None = None
    distance: str | None = None


class ScanResult(BaseModel):
    delivery_id: str
    verified: bool = True
    message: str = "QR code verified"


class RiderLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: float | None = None
