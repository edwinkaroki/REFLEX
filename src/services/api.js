/**
 * Shared API client for all services
 * Uses native Fetch API
 * 
 * Base URL and endpoints are configured here.
 * All endpoint paths are marked as TBD until backend team confirms.
 */

// TODO: confirm API_BASE_URL with backend team
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Helper to make fetch requests with proper error handling
 */
async function request(method, endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  // If response is not ok, throw an error with details
  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { status: response.status, data };
}

/**
 * API client with convenience methods
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

export default api;
