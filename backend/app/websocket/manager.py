from __future__ import annotations

from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}
        self.connection_roles: dict[str, str] = {}

    async def connect(self, user_id: str, websocket: WebSocket, role: str | None = None):
        await websocket.accept()
        self.active_connections.setdefault(user_id, [])
        self.active_connections[user_id].append(websocket)

        if role is not None:
            self.connection_roles[user_id] = role

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id not in self.active_connections:
            return

        if websocket in self.active_connections[user_id]:
            self.active_connections[user_id].remove(websocket)

        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
            self.connection_roles.pop(user_id, None)

    async def send_to_user(self, user_id: str, message: dict[str, Any]):
        for connection in list(self.active_connections.get(user_id, [])):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(user_id, connection)

    async def send_to_users(self, user_ids: list[str], message: dict[str, Any]):
        for user_id in set(user_ids):
            await self.send_to_user(str(user_id), message)

    async def send_to_role(self, role: str, message: dict[str, Any]):
        for user_id, connection_role in list(self.connection_roles.items()):
            if connection_role == role:
                await self.send_to_user(user_id, message)

    async def broadcast(self, message: dict[str, Any]):
        for user_id in list(self.active_connections):
            await self.send_to_user(user_id, message)

    async def send_personal_message(self, message: dict[str, Any], user_id: str):
        await self.send_to_user(user_id, message)


manager = ConnectionManager()
