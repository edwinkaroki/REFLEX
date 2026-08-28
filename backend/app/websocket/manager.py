class ConnectionManager:
    """Track WebSocket connections; authentication and recipient scoping are TODO."""

    def __init__(self) -> None:
        self.connections: set = set()

    async def connect(self, websocket) -> None:
        await websocket.accept()
        self.connections.add(websocket)

    def disconnect(self, websocket) -> None:
        self.connections.discard(websocket)

    async def broadcast(self, message: dict) -> None:
        for websocket in tuple(self.connections):
            await websocket.send_json(message)


manager = ConnectionManager()
