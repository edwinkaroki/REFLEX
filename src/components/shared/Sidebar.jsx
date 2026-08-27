import {
  LayoutDashboard,
  Truck,
  X,
  Bike,
  Settings2,
  CircleHelp,
  ChevronDown,
  PlusCircle,
  ScanQrCode,
} from "lucide-react";

import RoleSwitcher
  from "./RoleSwitcher";


export default function Sidebar({
  role,
  setRole,
  mobileOpen,
  setMobileOpen,
  onOperationClick,
}) {

  const operationLinksByRole = {
    dispatcher: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "Deliveries", icon: Truck },
    ],
    retailer: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "My deliveries", icon: Truck },
      { name: "New delivery", icon: PlusCircle },
    ],
    rider: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "My deliveries", icon: Truck },
      { name: "Scan QR code", icon: ScanQrCode },
    ],
  };

  const operationLinks = operationLinksByRole[role] || operationLinksByRole.dispatcher;


  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>

      {/* LOGO */}

      <div className="sidebar-brand-row">

        <div className="sidebar-brand">

          <div
            className="brand-mark"
          >
            <Bike className="bike-logo" size={23} strokeWidth={2.4} aria-label="Reflex delivery bike" />
          </div>

          <div>

            <h1 className="brand-name">
              Reflex
            </h1>

            <p className="brand-caption">
              Delivery Platform
            </p>

          </div>

        </div>


        <button
          onClick={() =>
            setMobileOpen(false)
          }
          className="sidebar-close md:hidden"
        >
          <X size={20} />
        </button>

      </div>


      {/* ROLE */}

      <div className="role-section">
        <p className="sidebar-section-label">Workspace</p>
        <div className="workspace-card">
          <span className="workspace-avatar">{role === "dispatcher" ? "D" : role === "retailer" ? "R" : "R"}</span>
          <span className="workspace-copy"><strong>{role === "dispatcher" ? "Dispatch team" : role === "retailer" ? "Retailer workspace" : "Rider workspace"}</strong><small>{role === "dispatcher" ? "Operations" : "Personal account"}</small></span>
          <ChevronDown size={15} />
          <RoleSwitcher role={role} setRole={setRole} />
        </div>
      </div>


      {/* NAVIGATION */}

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Operations</p>
        {operationLinks.map(
          ({ name, icon: Icon }, index) => (

            <button
              key={name}
              onClick={() => onOperationClick?.(name)}
              className={`sidebar-link ${index === 0 ? "active" : ""}`}
            >

              <Icon size={18} />

              {name}

            </button>

          )
        )}
        <p className="sidebar-section-label account-label">Account</p>
        <button className="sidebar-link"><Settings2 size={18} />Settings</button>
        <button className="sidebar-link"><CircleHelp size={18} />Help center</button>
      </nav>

    </aside>
  );
}