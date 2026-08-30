// TODO(backend): confirm production base URL and align this with the shared API configuration.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      // Keep the useful HTTP status when the server does not return JSON.
    }
    throw new Error(`${detail} (${response.status})`);
  }
  return response.json();
}

function authHeaders(token, includeJson = false) {
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export function getRetailerProfile(token) {
  // TODO(backend): confirm endpoint and profile response fields.
  return request("/retailer/profile", {
    headers: authHeaders(token),
  });
}

export function updateRetailerProfile(data, token) {
  // TODO(backend): confirm PATCH method, writable profile fields, and response shape.
  return request("/retailer/profile", {
    method: "PATCH",
    headers: authHeaders(token, true),
    body: JSON.stringify(data),
  });
}

export function createDelivery(data, token) {
  // TODO(backend): confirm create payload fields, validation errors, and returned delivery shape.
  return request("/deliveries", {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(data),
  });
}

export function getRetailerDeliveries(token) {
  // TODO(backend): confirm retailer scoping, pagination, and list response shape.
  return request("/deliveries/my", {
    headers: authHeaders(token),
  });
}

export function getDelivery(deliveryId, token) {
  // TODO(backend): confirm detail response fields and authorization behavior.
  return request(`/deliveries/${encodeURIComponent(deliveryId)}`, {
    headers: authHeaders(token),
  });
}
