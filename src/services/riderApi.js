/**
 * Rider API Service
 * 
 * Handles all API requests for the Rider persona.
 * All endpoints are marked TODO until backend team confirms actual paths.
 * 
 * Authentication: All requests use Bearer token from localStorage.
 * Error handling: Network errors, unauthorized (401), and server errors (5xx)
 * are thrown and must be handled by the caller.
 */

import api from "./api";

const missingTokenError = () =>
  Promise.reject(new Error("Rider authentication is required."));

/**
 * Helper to add authorization header for API calls
 */
const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/**
 * Get the logged-in rider's profile information
 * @param {string} token - Bearer token from localStorage
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm the profile endpoint, method, and response fields.
export const getMyProfile = (token) =>
  token ? api.get("/rider/profile", authHeader(token)) : Promise.resolve(null);

/**
 * Get the rider's currently assigned delivery
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object|null}>}
 */
// TODO(backend): confirm the current-delivery endpoint and empty-response shape.
export const getCurrentDelivery = (token) =>
  token
    ? api.get("/rider/current-delivery", authHeader(token))
    : Promise.resolve(null);

/**
 * Get rider's delivery history / list of all deliveries
 * @param {string} token - Bearer token
 * @param {object} params - Optional query params (e.g., limit, offset, status)
 * @returns {Promise<{status: number, data: array}>}
 */
// TODO(backend): confirm list endpoint, query parameters, and pagination shape.
export const getMyDeliveries = (token, params = {}) => {
  if (!token) return Promise.resolve([]);
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/rider/deliveries?${query}` : "/rider/deliveries";
  return api.get(endpoint, authHeader(token));
};

/**
 * Update the status of a delivery
 * @param {string} deliveryId - Delivery ID
 * @param {string} status - New status (assigned, picked_up, in_transit, delivered)
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm status endpoint, HTTP method, allowed statuses, and response shape.
export const updateDeliveryStatus = (deliveryId, status, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/status`,
        { status },
        authHeader(token)
      )
    : missingTokenError();

/**
 * Get rider's notifications
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: array}>}
 */
// TODO(backend): confirm notifications endpoint and read/unread response fields.
export const getMyNotifications = (token) =>
  token
    ? api.get("/rider/notifications", authHeader(token))
    : Promise.resolve([]);

/**
 * Get rider's delivery statistics
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm stats endpoint and the exact metric names/units.
export const getMyDeliveryStats = (token) =>
  token
    ? api.get("/rider/stats", authHeader(token))
    : Promise.resolve({});

/**
 * Update rider's availability status
 * @param {string} status - Status (available, busy, offline)
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm availability endpoint, method, allowed values, and response shape.
export const updateMyAvailability = (status, token) =>
  token
    ? api.post("/rider/availability", { status }, authHeader(token))
    : missingTokenError();

/**
 * Complete a delivery (mark as delivered)
 * @param {string} deliveryId - Delivery ID
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm completion endpoint, method, required payload, and returned status.
export const completeDelivery = (deliveryId, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/complete`,
        {},
        authHeader(token)
      )
    : missingTokenError();

/**
 * Report a delivery as failed
 * @param {string} deliveryId - Delivery ID
 * @param {object} reason - Failure reason object { reason: string, notes?: string }
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm failure endpoint, method, and final reason payload schema.
export const reportFailedDelivery = (deliveryId, reason, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/failed`,
        reason,
        authHeader(token)
      )
    : missingTokenError();

/**
 * Scan a delivery QR code
 * @param {string} qrCode - QR code data from scanner
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
// TODO(backend): confirm QR endpoint, payload field, verification response, and delivery binding.
// TODO(backend): scan success must not imply completion; call completeDelivery() separately.
export const scanDeliveryQR = (qrCode, token) =>
  token
    ? api.post("/rider/scan-qr", { qrCode }, authHeader(token))
    : missingTokenError();
