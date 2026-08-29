"""Import model classes here so migrations can discover them."""
from app.models.user import User, UserRole
from app.models.rider import Rider, RiderStatus
from app.models.delivery import Delivery, DeliveryEvent, DeliveryStatus
from app.models.assignment import Assignment, AssignmentStatus
from app.models.location import RiderLocation
from app.models.notification import Notification, NotificationType
