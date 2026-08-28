/**
 * Shared API client for Reflex
 *
 * Backend API base URL can be configured with VITE_API_URL.
 * Falls back to the current development API URL.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// TODO(backend): confirm the production base URL and preserve VITE_API_URL configuration.

/**
 * Generic request helper
 */
async function request(method, endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type");
  const isJson =
    contentType && contentType.includes("application/json");

  const data = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      data?.message || `HTTP ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/**
 * Generic API client
 */
const api = {
  get: (endpoint, options = {}) =>
    request("GET", endpoint, options),

  post: (endpoint, body, options = {}) =>
    request("POST", endpoint, { ...options, body }),

  put: (endpoint, body, options = {}) =>
    request("PUT", endpoint, { ...options, body }),

  patch: (endpoint, body, options = {}) =>
    request("PATCH", endpoint, { ...options, body }),

  delete: (endpoint, options = {}) =>
    request("DELETE", endpoint, options),
};

/**
 * Get deliveries for dispatcher dashboard
 */
export async function getDeliveries(token) {
  // TODO(backend): confirm list response shape consumed by DispatcherDashboard.
  return api.get("/deliveries", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get riders for dispatcher dashboard
 */
export async function getRiders(token) {
  // TODO(backend): confirm rider list response shape consumed by DispatcherDashboard.
  return api.get("/riders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Assign delivery to rider
 */
export async function assignRider(deliveryId, riderId, token) {
  // TODO(backend): confirm assignment endpoint, method, payload names, and response shape.
  return api.post(
    "/assignments",
    {
      delivery_id: deliveryId,
      rider_id: riderId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Update assignment
 */
export async function updateAssignment(
  assignmentId,
  status,
  token
) {
  // TODO(backend): confirm assignment status values and update response shape.
  return api.patch(
    `/assignments/${assignmentId}`,
    {
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export default api;
