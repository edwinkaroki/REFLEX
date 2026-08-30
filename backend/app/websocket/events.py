"""WebSocket event names for the realtime delivery workflow."""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Iterable

from app.websocket.manager import manager

DELIVERY_CREATED = "delivery.created"
DELIVERY_ASSIGNED = "delivery.assigned"
DELIVERY_STATUS_UPDATED = "delivery.status_changed"
RIDER_LOCATION_UPDATED = "rider.location_updated"
RIDER_AVAILABILITY_UPDATED = "rider.availability_updated"
NOTIFICATION_CREATED = "notification.created"

EVENT_ALIASES = {
    "delivery_status_changed": DELIVERY_STATUS_UPDATED,
    "delivery.created": DELIVERY_CREATED,
    "delivery.assigned": DELIVERY_ASSIGNED,
    "rider.location_updated": RIDER_LOCATION_UPDATED,
    "rider.availability_updated": RIDER_AVAILABILITY_UPDATED,
    "notification.created": NOTIFICATION_CREATED,
}


def build_event(event: str, data: dict) -> dict:
    return {
        "event": EVENT_ALIASES.get(event, event),
        "data": data,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def _emit_now(coro):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(coro)
    else:
        loop = asyncio.get_running_loop()
        loop.create_task(coro)


async def _emit_to_targets(event: str, data: dict, user_ids: Iterable[str] | None = None, roles: Iterable[str] | None = None):
    message = build_event(event, data)
    targets = set(user_ids or [])

    if roles:
        for user_id, role in manager.connection_roles.items():
            if role in set(roles):
                targets.add(str(user_id))

    if not targets and not roles:
        await manager.broadcast(message)
        return

    await manager.send_to_users(sorted(targets), message)


def emit_delivery_created(delivery_id: str, retailer_id: str, payload: dict | None = None):
    _emit_now(
        _emit_to_targets(
            DELIVERY_CREATED,
            {"delivery_id": str(delivery_id), "retailer_id": str(retailer_id), **(payload or {})},
            user_ids=[str(retailer_id)],
            roles=["dispatcher", "admin"],
        )
    )


def emit_delivery_assigned(delivery_id: str, rider_id: str, rider_user_id: str | None, retailer_id: str | None, payload: dict | None = None):
    recipients = set()
    if rider_user_id:
        recipients.add(str(rider_user_id))
    if retailer_id:
        recipients.add(str(retailer_id))
    _emit_now(
        _emit_to_targets(
            DELIVERY_ASSIGNED,
            {"delivery_id": str(delivery_id), "rider_id": str(rider_id), **(payload or {})},
            user_ids=sorted(recipients),
            roles=["dispatcher", "admin"],
        )
    )


def emit_delivery_status_changed(delivery_id: str, rider_id: str | None, retailer_id: str | None, payload: dict | None = None):
    recipients = set()
    if rider_id:
        recipients.add(str(rider_id))
    if retailer_id:
        recipients.add(str(retailer_id))
    _emit_now(
        _emit_to_targets(
            DELIVERY_STATUS_UPDATED,
            {"delivery_id": str(delivery_id), **(payload or {})},
            user_ids=sorted(recipients),
            roles=["dispatcher", "admin"],
        )
    )


def emit_rider_location_updated(rider_user_id: str, rider_id: str, latitude: float, longitude: float, accuracy_meters: float | None = None):
    _emit_now(
        _emit_to_targets(
            RIDER_LOCATION_UPDATED,
            {
                "rider_id": str(rider_id),
                "user_id": str(rider_user_id),
                "latitude": latitude,
                "longitude": longitude,
                "accuracy_meters": accuracy_meters,
            },
            user_ids=[str(rider_user_id)],
            roles=["dispatcher", "admin"],
        )
    )


def emit_rider_availability_updated(rider_user_id: str, rider_id: str, status: str):
    _emit_now(
        _emit_to_targets(
            RIDER_AVAILABILITY_UPDATED,
            {"rider_id": str(rider_id), "user_id": str(rider_user_id), "status": status},
            user_ids=[str(rider_user_id)],
            roles=["dispatcher", "admin"],
        )
    )


def emit_notification_created(user_id: str, message: str, notification_type: str):
    _emit_now(
        _emit_to_targets(
            NOTIFICATION_CREATED,
            {"user_id": str(user_id), "message": message, "type": notification_type},
            user_ids=[str(user_id)],
        )
    )
