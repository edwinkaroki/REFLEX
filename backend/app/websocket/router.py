from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = "guest"):
    # TODO(backend): authenticate the connection before accepting it.
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message({"event": "echo", "data": data}, user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
