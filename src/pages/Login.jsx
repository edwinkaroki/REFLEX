import { useState } from "react";
import { login } from "../services/authApi";

const roles = [
  { value: "dispatcher", label: "Dispatcher" },
  { value: "retailer", label: "Retailer" },
  { value: "rider", label: "Rider" },
];

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState("dispatcher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleRoleChange(event) {
    setSelectedRole(event.target.value);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);

      if (typeof onLogin !== "function") {
        throw new Error("Login handler is not available.");
      }

      if (data.role !== selectedRole && selectedRole !== "dispatcher") {
        // keep the UI and backend in sync, but allow explicit login for the selected role.
      }

      onLogin(data);
    } catch (requestError) {
      console.error("Login error:", requestError);
      setError(requestError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 login-shell">
      <div className="panel w-full max-w-md p-6 login-panel">
        <div className="mb-6 login-heading">
          <div className="login-mark" aria-hidden="true"><span>R</span></div>
          <p className="date-label">REFLEX DELIVERY PLATFORM</p>

          <h1 className="text-2xl font-semibold mt-2">Move every delivery forward.</h1>

          <p className="text-muted mt-1">Sign in to your workspace and keep every handoff in motion.</p>
        </div>

        <div className="mb-4 login-persona">
          <label htmlFor="persona" className="block text-sm font-medium mb-2">
            Persona
          </label>

          <div className="login-select-wrap">
            <select
              id="persona"
              value={selectedRole}
              onChange={handleRoleChange}
              className="login-role-select"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <span className="login-field-hint">Choose the workspace you want to enter.</span>
        </div>

        {error && (
          <div className="api-alert error-alert mb-4">
            <strong>Sign in failed</strong>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="retailer-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Signing in..." : `Sign in as ${roles.find((role) => role.value === selectedRole)?.label}`}
          </button>
        </form>
      </div>
    </div>
  );
}
