/**
 * Rider API Service
 * 
 * Handles all API requests for the Rider persona.
 * All endpoints are marked TBD until backend team confirms actual paths.
 * 
 * Authentication: All requests use Bearer token from localStorage.
 * Error handling: Network errors, unauthorized (401), and server errors (5xx)
 * are thrown and must be handled by the caller.
 */

import api from "./api";
import { mockDeliveries } from "../data/mockData";

const demoProfile = {
  id: "R-001",
  name: "Demo Rider",
  phone: "+254 700 000 000",
  vehicleType: "Motorbike",
  availability: "on_delivery",
};

const demoNotifications = [
  {
    id: "N-001",
    type: "delivery_assigned",
    title: "New delivery assigned",
    message: "A delivery has been assigned to you.",
    deliveryId: "DL-1046",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const demoDeliveries = mockDeliveries
  .filter((delivery) => delivery.rider_id === 1)
  .map((delivery) => ({
    ...delivery,
    customerName: delivery.customer_name,
  }));

const demoResponse = (data) => Promise.resolve({ status: 200, data });

/**
 * Helper to add authorization header
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
export const getMyProfile = (token) =>
  token ? api.get("/rider/profile", authHeader(token)) : demoResponse(demoProfile);
  // TODO: confirm endpoint with backend team

/**
 * Get the rider's currently assigned delivery
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object|null}>}
 */
export const getCurrentDelivery = (token) =>
  token
    ? api.get("/rider/current-delivery", authHeader(token))
    : demoResponse(
        demoDeliveries.find((delivery) => delivery.status !== "delivered")
          ? {
              ...demoDeliveries.find((delivery) => delivery.status !== "delivered"),
              status: "assigned",
            }
          : null
      );
  // TODO: confirm endpoint with backend team
  // Expected response: null or empty array if no active delivery

/**
 * Get rider's delivery history / list of all deliveries
 * @param {string} token - Bearer token
 * @param {object} params - Optional query params (e.g., limit, offset, status)
 * @returns {Promise<{status: number, data: array}>}
 */
export const getMyDeliveries = (token, params = {}) => {
  if (!token) {
    const data = params.status
      ? demoDeliveries.filter((delivery) => delivery.status === params.status)
      : demoDeliveries;
    return demoResponse(data);
  }
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/rider/deliveries?${query}` : "/rider/deliveries";
  return api.get(endpoint, authHeader(token));
  // TODO: confirm endpoint with backend team
};

/**
 * Update the status of a delivery
 * @param {string} deliveryId - Delivery ID
 * @param {string} status - New status (accepted, picked_up, out_for_delivery, delivered, failed)
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
export const updateDeliveryStatus = (deliveryId, status, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/status`,
        { status },
        authHeader(token)
      )
    : demoResponse({ id: deliveryId, status });
  // TODO: confirm endpoint with backend team

/**
 * Get rider's notifications
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: array}>}
 */
export const getMyNotifications = (token) =>
  token
    ? api.get("/rider/notifications", authHeader(token))
    : demoResponse(demoNotifications);
  // TODO: confirm endpoint with backend team

/**
 * Get rider's delivery statistics
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
export const getMyDeliveryStats = (token) =>
  token
    ? api.get("/rider/stats", authHeader(token))
    : demoResponse({
        active: demoDeliveries.filter((delivery) => delivery.status !== "delivered").length,
        completedToday: 0,
        failedToday: 0,
        total: demoDeliveries.length,
      });
  // TODO: confirm endpoint with backend team
  // Expected: { active, completedToday, failedToday, total }

/**
 * Update rider's availability status
 * @param {string} status - Status (available, busy, offline)
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
export const updateMyAvailability = (status, token) =>
  token
    ? api.post("/rider/availability", { status }, authHeader(token))
    : demoResponse({ ...demoProfile, availability: status });
  // TODO: confirm endpoint with backend team

/**
 * Complete a delivery (mark as delivered)
 * @param {string} deliveryId - Delivery ID
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
export const completeDelivery = (deliveryId, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/complete`,
        {},
        authHeader(token)
      )
    : demoResponse({ id: deliveryId, status: "delivered" });
  // TODO: confirm endpoint with backend team

/**
 * Report a delivery as failed
 * @param {string} deliveryId - Delivery ID
 * @param {object} reason - Failure reason object { reason: string, notes?: string }
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
export const reportFailedDelivery = (deliveryId, reason, token) =>
  token
    ? api.post(
        `/rider/delivery/${deliveryId}/failed`,
        reason,
        authHeader(token)
      )
    : demoResponse({ id: deliveryId, status: "failed" });
  // TODO: confirm endpoint with backend team

/**
 * Scan a delivery QR code
 * @param {string} qrCode - QR code data from scanner
 * @param {string} token - Bearer token
 * @returns {Promise<{status: number, data: object}>}
 */
export const scanDeliveryQR = (qrCode, token) =>
  token
    ? api.post("/rider/scan-qr", { qrCode }, authHeader(token))
    : demoResponse({ qrCode, status: "accepted" });
  // TODO: confirm endpoint with backend team
