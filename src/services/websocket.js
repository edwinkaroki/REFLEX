const WS_URL = "ws://localhost:8000/ws";

let socket = null;

export function connectWebSocket(onMessage) {
	socket = new WebSocket(WS_URL);

	socket.onopen = () => {
		console.log("WebSocket connected");
	};

	socket.onmessage = (event) => {
		try {
			onMessage(JSON.parse(event.data));
		} catch (error) {
			console.error("Invalid WebSocket message:", error);
		}
	};

	socket.onerror = (error) => {
		console.error("WebSocket error:", error);
	};

	socket.onclose = () => {
		console.log("WebSocket disconnected");
	};

	return socket;
}

export function disconnectWebSocket() {
	if (socket) {
		socket.close();
		socket = null;
	}
}
