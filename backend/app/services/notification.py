"""Notification business logic boundary."""

import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: uuid.UUID,
        message: str,
        notification_type: NotificationType
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            message=message,
            type=notification_type,
            read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(db: Session, user_id: uuid.UUID) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: uuid.UUID) -> Optional[Notification]:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.read = True
            db.commit()
            db.refresh(notification)
        return notification
