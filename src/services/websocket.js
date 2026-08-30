const WS_BASE_URL = (import.meta.env.VITE_WS_URL || "ws://localhost:8001").replace(/\/$/, "");

export function connectWebSocket({ token, onEvent, onOpen, onError, onClose }) {
  if (typeof window === "undefined" || !token) {
    return null;
  }

  const socket = new WebSocket(`${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`);

  socket.addEventListener("open", () => {
    if (onOpen) {
      onOpen(socket);
    }
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (payload && payload.event && typeof onEvent === "function") {
        onEvent(payload);
      }
    } catch (error) {
      console.warn("WebSocket payload parse error:", error);
    }
  });

  socket.addEventListener("error", (event) => {
    if (onError) {
      onError(event);
    }
  });

  socket.addEventListener("close", () => {
    if (onClose) {
      onClose();
    }
  });

  return socket;
}

export function disconnectWebSocket(socket) {
  if (socket && socket.readyState < 2) {
    socket.close();
  }
}
