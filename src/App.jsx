import { useState } from "react";
import DispatcherDashboard from "./pages/dispatcher/DispatcherDashboard";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import RiderDashboard from "./pages/rider/RiderDashboard";
import Login from "./pages/Login";
import { getStoredAuth, logout } from "./services/authApi";
import "./index.css";

function App() {
  const storedAuth = getStoredAuth();

  const [auth, setAuth] = useState(storedAuth);
  const [activePage, setActivePage] = useState("dashboard");

  function handleLogin(data) {
    setAuth({
      token: data.access_token,
      role: data.role,
      userId: data.user_id,
    });
    setActivePage("dashboard");
  }

  function handleLogout() {
    logout();

    setAuth({
      token: null,
      role: null,
      userId: null,
    });
    setActivePage("dashboard");
  }

  if (!auth.token || !auth.role) {
    return <Login onLogin={handleLogin} />;
  }

  const dashboardProps = {
    role: auth.role,
    setRole: () => {},
    activePage,
    setActivePage,
    onLogout: handleLogout,
  };

  if (auth.role === "retailer") {
    return <RetailerDashboard {...dashboardProps} />;
  }

  if (auth.role === "rider") {
    return <RiderDashboard {...dashboardProps} />;
  }

  if (auth.role === "dispatcher" || auth.role === "admin") {
    return <DispatcherDashboard {...dashboardProps} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default App;
