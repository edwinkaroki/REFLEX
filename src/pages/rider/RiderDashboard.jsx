import { useEffect, useState } from "react";
import { AlertCircle, Bike, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, History, LocateFixed, MapPin, Package, QrCode, ScanLine, Truck, User } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatCard from "../../components/dispatcher/StatCard";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import RiderDeliveries from "./RiderDeliveries";
import RiderNotifications from "./RiderNotifications";
import RiderProfile from "./RiderProfile";
import { completeDelivery, getCurrentDelivery, getMyDeliveryStats, getMyProfile, scanDeliveryQR, updateDeliveryStatus, updateMyAvailability } from "../../services/riderApi";

export default function RiderDashboardWrapper({ role, setRole, activePage = "dashboard", setActivePage = () => {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (nextPage) => {
    setActivePage(nextPage);
    setMobileOpen(false);
  };

  if (activePage === "deliveries") return <RiderDeliveries role={role} setRole={setRole} activePage={activePage} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />;
  if (activePage === "notifications") return <RiderNotifications role={role} setRole={setRole} activePage={activePage} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />;
  if (activePage === "profile") return <RiderProfile role={role} setRole={setRole} activePage={activePage} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />;
  if (activePage === "scan") return <RiderOverview role={role} setRole={setRole} activePage={activePage} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />;
  return <RiderOverview role={role} setRole={setRole} activePage={activePage} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />;
}

function RiderOverview({ role, setRole, activePage = "dashboard", onNavigate, mobileOpen, setMobileOpen }) {
  const [profile, setProfile] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [location, setLocation] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [handoffConfirmed, setHandoffConfirmed] = useState(false);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const results = await Promise.all([
        getMyProfile(token).catch((requestError) => ({ error: requestError })),
        getCurrentDelivery(token).catch((requestError) => ({ error: requestError })),
        getMyDeliveryStats(token).catch((requestError) => ({ error: requestError })),
      ]);
      const [profileResult, deliveryResult, statsResult] = results;
      if (results.every((result) => result.error)) setError("Unable to connect to the rider service.");
      setProfile(profileResult.error ? null : profileResult);
      setDelivery(deliveryResult.error ? null : deliveryResult);
      setStats(statsResult.error ? {} : statsResult);
      setLoading(false);
    }
    loadDashboard();
  }, [token]);

  useEffect(() => {
    if (!sharingLocation) return undefined;
    const locationTimer = window.setInterval(() => {
      setLocation((current) => current || "Updating GPS...");
    }, 10000);
    return () => window.clearInterval(locationTimer);
  }, [sharingLocation]);

  async function updateStatus(status) {
    if (!delivery?.id) return;
    setActionLoading(status);
    setActionError(null);
    try {
      const response = status === "delivered"
        ? await completeDelivery(delivery.id, token)
        : await updateDeliveryStatus(delivery.id, status, token);
      setDelivery((current) => ({ ...current, status: response?.status || status }));
      if (status === "delivered") setStats((current) => ({ ...current, active: 0, completedToday: (current.completedToday || 0) + 1 }));
    } catch (requestError) {
      setActionError(requestError.message || "Could not update delivery status.");
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmHandoff() {
    if (!delivery?.id) return;
    // TODO(backend): replace the demo input with the confirmed QR scanner integration.
    const qrCode = window.prompt("Scan or enter customer QR code:", "");
    if (!qrCode) return;
    setActionLoading("scan");
    setActionError(null);
    try {
      await scanDeliveryQR(qrCode, token);
      setHandoffConfirmed(true);
      // Handoff confirmed but NOT marked delivered - backend must verify QR
      // Delivery status update happens via updateDeliveryStatus or completeDelivery
    } catch (requestError) {
      setActionError(requestError.message || "Could not confirm the handoff.");
    } finally {
      setActionLoading(null);
    }
  }

  function toggleLocation() {
    if (sharingLocation) return setSharingLocation(false);
    // TODO(backend): add the confirmed location-sharing request when that contract exists.
    if (!navigator.geolocation) return setActionError("Location is not available in this browser.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`); setSharingLocation(true); },
      () => { setLocation(null); setSharingLocation(true); }
    );
  }

  async function handleAvailabilityChange(newStatus) {
    setActionLoading("availability");
    setActionError(null);
    try {
      await updateMyAvailability(newStatus, token);
      setProfile((current) => ({ ...current, availability: newStatus }));
    } catch (requestError) {
      setActionError(requestError.message || "Could not update availability status.");
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    if (activePage === "scan" && !handoffConfirmed) {
      confirmHandoff();
    }
  }, [activePage]);

  const status = delivery?.status || "available";
  const nextStatus = { assigned: "picked_up", picked_up: "in_transit", in_transit: "delivered" }[status];
  const nextLabel = { picked_up: "Mark picked up", in_transit: "Start in transit", delivered: "Mark delivered" }[nextStatus];
  const earnings = stats.earnings;

  return <div className="rider-shell">
    <Sidebar role={role} setRole={setRole} activePage={activePage} onNavigate={onNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="rider-main">
      <div className="rider-topbar"><button className="mobile-menu rider-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">Menu</button><div className="rider-crumb">Workspace <b>/</b> <strong>Overview</strong></div><div className="rider-user"><span className="online-dot" /> {profile?.name || "Rider account unavailable"} <User size={15} /></div></div>
      <div className="rider-content">
        <div className="rider-page-intro"><div><p className="rider-date">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</p><h1>Rider Overview</h1><p>Stay on top of your route, deliveries, and earnings.</p></div><button className={`rider-location-button ${sharingLocation ? "is-sharing" : ""}`} onClick={toggleLocation}><LocateFixed size={16} />{sharingLocation ? "Location sharing on" : "Share my location"}</button></div>
        {(error || actionError) && <div className="rider-alert"><AlertCircle size={17} />{error || actionError}</div>}
        <div className="stats-grid rider-stats"><StatCard title="Active delivery" value={stats.active ?? 0} icon={<Truck size={20} />} /><StatCard title="Completed today" value={stats.completedToday ?? 0} icon={<CheckCircle2 size={20} />} /><StatCard title="Today's earnings" value={earnings == null ? "KES 0" : `KES ${Number(earnings).toLocaleString()}`} icon={<CircleDollarSign size={20} />} /><StatCard title="Rider status" value={profile?.availability === "busy" ? "On route" : profile?.availability || "Unavailable"} icon={<Bike size={20} />} /></div>
        <div className="rider-grid">
          <section className="rider-panel rider-delivery-panel"><div className="rider-panel-heading"><div><h2>Current delivery</h2><p>Your next stop, pickup to doorstep.</p></div><StatusBadge status={status} /></div>{delivery ? <><div className="delivery-hero"><div className="delivery-number"><span>DELIVERY</span><strong>#{delivery.id}</strong></div><div className="delivery-time"><Clock3 size={16} /> Today</div></div><div className="route-steps"><div className="route-step"><span className="route-icon pickup"><Package size={17} /></span><div><small>Pickup information</small><strong>{delivery.pickupName || "Pickup information unavailable"}</strong><p>{delivery.pickupAddress || "Pickup address unavailable"}</p></div></div><div className="route-line" /><div className="route-step"><span className="route-icon dropoff"><MapPin size={17} /></span><div><small>Customer / drop-off</small><strong>{delivery.customerName || delivery.customer_name || "Customer information unavailable"}</strong><p>{delivery.address || delivery.dropoff_address || "Drop-off address unavailable"}</p></div></div></div><div className="delivery-detail-strip"><div><small>Package</small><strong>{delivery.packageInfo || delivery.package || "Package information unavailable"}</strong></div><div><small>Customer phone</small><strong>{delivery.customerPhone || delivery.customer_phone || "Phone unavailable"}</strong></div><div><small>Distance</small><strong>{delivery.distance || "Distance unavailable"}</strong></div></div>{handoffConfirmed && <div className="handoff-success"><CheckCircle2 size={18} /> Successful handoff confirmed</div>}<div className="rider-actions">{nextStatus && <button className="primary-action" onClick={() => updateStatus(nextStatus)} disabled={actionLoading}><CheckCircle2 size={16} />{actionLoading === nextStatus ? "Updating..." : nextLabel}</button>}{!handoffConfirmed && <button className="outline-action" onClick={confirmHandoff} disabled={actionLoading === "scan"}><ScanLine size={16} />{actionLoading === "scan" ? "Confirming..." : "Scan & confirm handoff"}</button>}</div></> : <div className="empty-delivery"><Truck size={34} /><strong>No active delivery</strong><p>New assignments will appear here.</p></div>}</section>
          <aside className="rider-side-stack"><section className="rider-panel status-panel"><div className="rider-panel-heading"><div><h2>Availability</h2><p>Let dispatch know your status.</p></div><span className="status-live"><span className="online-dot" /> Live</span></div><div className="availability-card"><div className="rider-avatar-large"><Bike size={22} /></div><div><strong>{profile?.name || "Rider account unavailable"}</strong><p>{profile?.vehicleType || "Vehicle unavailable"} · {profile?.phone || "Phone unavailable"}</p></div></div><div className="availability-options"><button className={profile?.availability !== "busy" ? "selected" : ""} onClick={() => handleAvailabilityChange("available")} disabled={!profile || actionLoading === "availability"}><span className="availability-dot available" />Available</button><button className={profile?.availability === "busy" ? "selected" : ""} onClick={() => handleAvailabilityChange("busy")} disabled={!profile || actionLoading === "availability"}><span className="availability-dot busy" />Busy</button></div></section><section className="rider-panel location-panel"><div className="rider-panel-heading"><div><h2>Location updates</h2><p>GPS status while on delivery.</p></div><LocateFixed size={18} /></div><div className="location-readout"><MapPin size={17} /><div><strong>{sharingLocation ? "Location is being shared" : "Location is paused"}</strong><small>{location || "Enable GPS to simulate updates"}</small></div></div><button className="text-action rider-location-action" onClick={toggleLocation}>{sharingLocation ? "Stop sharing" : "Start location updates"}<ChevronRight size={14} /></button></section></aside>
        </div>
        <section className="rider-panel rider-tools-panel"><div className="rider-panel-heading"><div><h2>Rider tools</h2><p>Everything you need for the next handoff.</p></div></div><div className="rider-tool-grid"><button onClick={() => onNavigate("deliveries")}><History size={19} /><span><strong>My deliveries</strong><small>Assigned and completed jobs</small></span><ChevronRight size={16} /></button><button onClick={confirmHandoff}><QrCode size={19} /><span><strong>Scan QR code</strong><small>Confirm a successful handoff</small></span><ChevronRight size={16} /></button><button onClick={() => onNavigate("profile")}><User size={19} /><span><strong>My profile</strong><small>Update rider details</small></span><ChevronRight size={16} /></button></div></section>
      </div>
    </main>
  </div>;
}


