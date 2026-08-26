import { useState } from "react";
import { ArrowRight, Bell, Bike, Clock3, MapPin, Package, Plus, Search, Truck, UserRound, X } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatCard from "../../components/dispatcher/StatCard";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import DeliveryTable from "../../components/dispatcher/DeliveryTable";
import { mockDeliveries, mockRiders } from "../../data/mockData";

export default function DispatcherDashboard({ role, setRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [search, setSearch] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const riders = mockRiders;
  const active = deliveries.filter((delivery) => delivery.status !== "delivered").length;
  const outForDelivery = deliveries.filter((delivery) => delivery.status === "out_for_delivery").length;
  const delivered = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const pending = deliveries.filter((delivery) => delivery.status === "pending").length;
  const filtered = deliveries.filter((delivery) => `${delivery.id} ${delivery.customer_name} ${delivery.address}`.toLowerCase().includes(search.toLowerCase()));

  function assignRider(riderId) {
    setDeliveries((previous) => previous.map((delivery) => delivery.id === selectedDelivery.id ? { ...delivery, rider_id: Number(riderId), status: "assigned" } : delivery));
    setSelectedDelivery(null);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar role={role} setRole={setRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="md:ml-64">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
          <div className="topbar-actions"><UserRound size={16} /><strong>Dispatcher view</strong><span className="topbar-chevron">⌄</span><span className="notification"><Bell size={18} /><i /></span><button className="mobile-menu" onClick={() => setMobileOpen(true)}>Menu</button></div>
        </header>
        <div className="dashboard-content">
          <section className="page-intro"><div><p className="date-label">WEDNESDAY, 24 APRIL 2024</p><h1>Delivery Overview</h1><p className="text-muted">A clear view of every order, from pickup to doorstep.</p></div><button className="primary-button new-delivery"><Plus size={17} /> New delivery</button></section>
          <section className="stats-grid">
            <StatCard title="Active deliveries" value={String(active).padStart(2, "0")} icon={<Package />} />
            <StatCard title="Out for delivery" value={String(outForDelivery).padStart(2, "0")} icon={<Truck />} />
            <StatCard title="Delivered today" value={String(delivered).padStart(2, "0")} icon={<Bike />} />
            <StatCard title="Needs attention" value={String(pending).padStart(2, "0")} icon={<Clock3 />} />
          </section>
          <section className="overview-grid">
            <article className="panel deliveries-panel">
              <div className="panel-heading"><div><h3>Active deliveries</h3><p>Your most recent delivery activity</p></div><button className="text-action">View all <ArrowRight size={15} /></button></div>
              <div className="table-tools"><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search deliveries..." /></div><button className="filter-button">All statuses <span>⌄</span></button></div>
              <div className="delivery-table-header"><span>Order</span><span>Customer</span><span>Package</span><span>Rider</span><span>Status</span><span /></div>
              <DeliveryTable deliveries={filtered} riders={riders} onAssign={setSelectedDelivery} />
            </article>
            <div className="side-panels">
              <article className="panel attention-panel"><div className="panel-heading"><div><h3>Needs attention</h3><p>Things that need your eyes</p></div><span className="alert-count">{pending}</span></div><div className="attention-item"><span className="attention-icon clock"><Clock3 size={17} /></span><div><strong>Unassigned delivery</strong><small>RX1039 · Aisha Hassan</small></div><ArrowRight size={16} /></div><div className="attention-item"><span className="attention-icon pin"><MapPin size={17} /></span><div><strong>Delivery delayed</strong><small>RX1040 · 8 minutes overdue</small></div><ArrowRight size={16} /></div></article>
              <article className="panel activity-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>Live updates from your team</p></div></div><div className="activity-item"><span className="activity-dot" /><div><small>10:42</small><strong>Rider picked up</strong><span>RX1042 · John Kamau</span></div></div><div className="activity-item"><span className="activity-dot green" /><div><small>10:18</small><strong>Delivery completed</strong><span>RX1041 · Mary Njeri</span></div></div><div className="activity-item"><span className="activity-dot orange" /><div><small>09:54</small><strong>New delivery created</strong><span>RX1040 · Aisha Hassan</span></div></div></article>
            </div>
          </section>
        </div>
      </main>
      {selectedDelivery && <div className="modal-backdrop"><div className="assign-modal"><div className="modal-heading"><div><h3>Assign rider</h3><p>Delivery #{selectedDelivery.id}</p></div><button onClick={() => setSelectedDelivery(null)}><X size={18} /></button></div>{riders.filter((rider) => rider.status === "available").map((rider) => <button className="rider-option" key={rider.id} onClick={() => assignRider(rider.id)}><span className="rider-avatar">{rider.name.charAt(0)}</span><span>{rider.name}</span><StatusBadge status={rider.status} /></button>)}</div></div>}
    </div>
  );
}
