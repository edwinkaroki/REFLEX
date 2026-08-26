import { useState } from "react";
import DispatcherDashboard from "./pages/dispatcher/DispatcherDashboard";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import RiderDashboard from "./pages/rider/RiderDashboard";
import "./index.css";

function App() {
  const [role, setRole] = useState("dispatcher");

  const dashboardProps = { role, setRole };

  if (role === "retailer") {
    return <RetailerDashboard {...dashboardProps} />;
  }

  if (role === "rider") {
    return <RiderDashboard {...dashboardProps} />;
  }

  return <DispatcherDashboard {...dashboardProps} />;
}

export default App;
