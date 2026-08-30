import api from "./api";

const missingTokenError = () =>
  Promise.reject(new Error("Rider authentication is required."));

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getMyProfile = (token) =>
  token ? api.get("/rider/profile", authHeader(token)) : Promise.resolve(null);

export const getCurrentDelivery = (token) =>
  token
    ? api.get("/rider/current-delivery", authHeader(token))
    : Promise.resolve(null);

export const getMyDeliveries = (token, params = {}) => {
  if (!token) return Promise.resolve([]);
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/rider/deliveries?${query}` : "/rider/deliveries";
  return api.get(endpoint, authHeader(token));
};

export const updateDeliveryStatus = (deliveryId, status, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/status`,
        { status },
        authHeader(token)
      )
    : missingTokenError();

export const getMyNotifications = (token) =>
  token
    ? api.get("/rider/notifications", authHeader(token))
    : Promise.resolve([]);

export const getMyDeliveryStats = (token) =>
  token
    ? api.get("/rider/stats", authHeader(token))
    : Promise.resolve({});

export const updateMyAvailability = (status, token) =>
  token
    ? api.post("/rider/availability", { status }, authHeader(token))
    : missingTokenError();

export const completeDelivery = (deliveryId, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/status`,
        { status: "delivered" },
        authHeader(token)
      )
    : missingTokenError();

export const reportFailedDelivery = (deliveryId, reason, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/status`,
        { status: "failed", ...reason },
        authHeader(token)
      )
    : missingTokenError();

export const scanDeliveryQR = (qrCode, token) =>
  token
    ? api.post("/rider/scan-qr", { qrCode }, authHeader(token))
    : missingTokenError();
