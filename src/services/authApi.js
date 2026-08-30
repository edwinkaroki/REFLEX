const API_BASE =
import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api";

export async function login(email, password) {
const response = await fetch(`${API_BASE}/auth/login`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Accept: "application/json",
},
body: JSON.stringify({
email,
password,
}),
});

if (!response.ok) {
let detail = "Login failed";


try {
  const body = await response.json();
  detail = body.detail || body.message || detail;
} catch {
  // Keep the default message when the API does not return JSON.
}

throw new Error(`${detail} (${response.status})`);


}

const data = await response.json();

localStorage.setItem("access_token", data.access_token);
localStorage.setItem("user_role", data.role);
localStorage.setItem("user_id", data.user_id);

return data;
}

export function logout() {
localStorage.removeItem("access_token");
localStorage.removeItem("user_role");
localStorage.removeItem("user_id");
}

export function getStoredAuth() {
return {
token: localStorage.getItem("access_token"),
role: localStorage.getItem("user_role"),
userId: localStorage.getItem("user_id"),
};
}
