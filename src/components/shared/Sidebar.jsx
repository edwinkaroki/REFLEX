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
  onNavigate,
  activePage = "dashboard",
  mobileOpen,
  setMobileOpen,
  onOperationClick,
}) {
  const operationLinksByRole = {
    dispatcher: [
      { name: "Overview", icon: LayoutDashboard, page: "dashboard" },
      { name: "Deliveries", icon: Truck, page: "deliveries" },
    ],
    retailer: [
      { name: "Overview", icon: LayoutDashboard, page: "dashboard" },
      { name: "My deliveries", icon: Truck, page: "deliveries" },
      { name: "New delivery", icon: PlusCircle, page: "new-delivery" },
    ],
    rider: [
      { name: "Overview", icon: LayoutDashboard, page: "dashboard" },
      { name: "My deliveries", icon: Truck, page: "deliveries" },
      { name: "Scan QR code", icon: ScanQrCode, page: "scan" },
    ],
  };

  const operationLinks = operationLinksByRole[role] || operationLinksByRole.dispatcher;

  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand-row">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Bike className="bike-logo" size={23} strokeWidth={2.4} aria-label="Reflex delivery bike" />
          </div>

          <div>
            <h1 className="brand-name">Reflex</h1>
            <p className="brand-caption">Delivery Platform</p>
          </div>
        </div>

        <button onClick={() => setMobileOpen?.(false)} className="sidebar-close md:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="role-section">
        <p className="sidebar-section-label">Workspace</p>
        <div className="workspace-card">
          <span className="workspace-avatar">{role === "dispatcher" ? "D" : role === "retailer" ? "R" : "R"}</span>
          <span className="workspace-copy"><strong>{role === "dispatcher" ? "Dispatch team" : role === "retailer" ? "Retailer workspace" : "Rider workspace"}</strong><small>{role === "dispatcher" ? "Operations" : "Personal account"}</small></span>
          <ChevronDown size={15} />
          <RoleSwitcher role={role} setRole={setRole} disabled />
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Operations</p>
        {operationLinks.map(({ name, icon: Icon, page }) => {
          const isActive = activePage === page;

          return (
            <button
              key={name}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => {
                onOperationClick?.(name);
                onNavigate?.(page);
                setMobileOpen?.(false);
              }}
            >
              <Icon size={18} />
              {name}
            </button>
          );
        })}
        <p className="sidebar-section-label account-label">Account</p>
        <button className="sidebar-link"><Settings2 size={18} />Settings</button>
        <button className="sidebar-link"><CircleHelp size={18} />Help center</button>
      </nav>
    </aside>
  );
}