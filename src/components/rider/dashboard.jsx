import { useState } from "react";
import Sidebar from "../../components/shared/Sidebar";
import Dashboard from "../../components/rider/Dashboard";
import Deliveries from "../../components/rider/Deliveries";
import Profile from "../../components/rider/Profile";

export default function RiderDashboard() {
  // Track which section is active
  const [activeSection, setActiveSection] = useState("dashboard");

  // Render the correct component based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "deliveries":
        return <Deliveries />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar with navigation */}
      <Sidebar
        role="rider"
        onNavigate={setActiveSection} // pass handler to sidebar
      />

      {/* Main content */}
      <main style={{ flex: 1, padding: "1rem" }}>
        <h1>Rider Dashboard</h1>
        {renderSection()}
      </main>
    </div>
  );
}

