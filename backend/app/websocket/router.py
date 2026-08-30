import json
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.websocket.manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        authorization = websocket.headers.get("authorization") or websocket.headers.get("Authorization")
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Missing user id in token")
        user_uuid = UUID(str(user_id))
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db: Session = SessionLocal()
    try:
        user = db.get(User, user_uuid)
    finally:
        db.close()

    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_key = str(user.id)
    await manager.connect(user_key, websocket, role=user.role.value)

    try:
        while True:
            raw = await websocket.receive_text()
            if not raw.strip():
                continue
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_to_user(
                    user_key,
                    {
                        "event": "socket.error",
                        "data": {"message": "Malformed JSON payload"},
                        "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
                    },
                )
                continue

            if isinstance(payload, dict) and payload.get("type") == "ping":
                await manager.send_to_user(
                    user_key,
                    {
                        "event": "pong",
                        "data": {"ok": True},
                        "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
                    },
                )
    except WebSocketDisconnect:
        manager.disconnect(user_key, websocket)
    except Exception:
        manager.disconnect(user_key, websocket)
