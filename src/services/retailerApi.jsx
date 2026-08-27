const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
  return request("/retailer/profile", {
    headers: authHeaders(token),
  });
}

export function updateRetailerProfile(data, token) {
  return request("/retailer/profile", {
    method: "PATCH",
    headers: authHeaders(token, true),
    body: JSON.stringify(data),
  });
}

export function createDelivery(data, token) {
  return request("/deliveries", {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(data),
  });
}

export function getRetailerDeliveries(token) {
  return request("/deliveries/my", {
    headers: authHeaders(token),
  });
}

export function getDelivery(deliveryId, token) {
  return request(`/deliveries/${encodeURIComponent(deliveryId)}`, {
    headers: authHeaders(token),
  });
}
