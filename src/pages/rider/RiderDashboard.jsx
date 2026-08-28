import { useEffect, useState } from "react";
import { AlertCircle, Bike, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, History, LocateFixed, MapPin, Package, QrCode, ScanLine, Truck, User } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatCard from "../../components/dispatcher/StatCard";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import RiderDeliveries from "./RiderDeliveries";
import RiderNotifications from "./RiderNotifications";
import RiderProfile from "./RiderProfile";
import { getCurrentDelivery, getMyDeliveryStats, getMyProfile, scanDeliveryQR, updateDeliveryStatus } from "../../services/riderApi";

export default function RiderDashboardWrapper({ role, setRole }) {
  const [page, setPage] = useState("dashboard");
  if (page === "deliveries") return <RiderDeliveries role={role} setRole={setRole} onNavigate={setPage} />;
  if (page === "notifications") return <RiderNotifications role={role} setRole={setRole} onNavigate={setPage} />;
  if (page === "profile") return <RiderProfile role={role} setRole={setRole} onNavigate={setPage} />;
  return <RiderOverview role={role} setRole={setRole} onNavigate={setPage} />;
}

function RiderOverview({ role, setRole, onNavigate }) {
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
      setProfile(profileResult.data || null);
      setDelivery(deliveryResult.data || null);
      setStats(statsResult.data || {});
      setLoading(false);
    }
    loadDashboard();
  }, [token]);

  useEffect(() => {
    if (!sharingLocation) return undefined;
    const locationTimer = window.setInterval(() => {
      setLocation((current) => current || "6.5244, 3.3792");
    }, 10000);
    return () => window.clearInterval(locationTimer);
  }, [sharingLocation]);

  async function updateStatus(status) {
    if (!delivery?.id) return;
    setActionLoading(status);
    setActionError(null);
    try {
      const response = await updateDeliveryStatus(delivery.id, status, token);
      setDelivery((current) => ({ ...current, status: response.data?.status || status }));
      if (status === "delivered") setStats((current) => ({ ...current, active: 0, completedToday: (current.completedToday || 0) + 1 }));
    } catch (requestError) {
      setActionError(requestError.data?.message || "Could not update delivery status.");
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmHandoff() {
    if (!delivery?.id) return;
    const qrCode = window.prompt("Enter the customer QR code to confirm handoff:");
    if (!qrCode) return;
    setActionLoading("scan");
    setActionError(null);
    try {
      await scanDeliveryQR(qrCode, token);
      setHandoffConfirmed(true);
      setDelivery((current) => ({ ...current, status: "delivered" }));
    } catch (requestError) {
      setActionError(requestError.data?.message || "Could not confirm the handoff.");
    } finally {
      setActionLoading(null);
    }
  }

  function toggleLocation() {
    if (sharingLocation) return setSharingLocation(false);
    if (!navigator.geolocation) return setActionError("Location is not available in this browser.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`); setSharingLocation(true); },
      () => { setLocation("6.5244, 3.3792"); setSharingLocation(true); }
    );
  }

  if (loading) return <div className="rider-shell"><Sidebar role={role} setRole={setRole} onNavigate={onNavigate} /><main className="rider-main rider-loading">Loading rider workspace...</main></div>;

  const status = delivery?.status || "available";
  const nextStatus = { assigned: "accepted", accepted: "picked_up", picked_up: "out_for_delivery", out_for_delivery: "delivered" }[status];
  const nextLabel = { accepted: "Accept assignment", picked_up: "Mark picked up", out_for_delivery: "Start delivery", delivered: "Mark delivered" }[nextStatus];
  const earnings = stats.earnings ?? (stats.completedToday || 0) * 850;

  return <div className="rider-shell">
    <Sidebar role={role} setRole={setRole} onNavigate={onNavigate} />
    <main className="rider-main">
      <div className="rider-topbar"><div className="rider-crumb">Workspace <b>/</b> <strong>Overview</strong></div><div className="rider-user"><span className="online-dot" /> {profile?.name || "Demo Rider"} <User size={15} /></div></div>
      <div className="rider-content">
        <div className="rider-page-intro"><div><p className="rider-date">WEDNESDAY, 28 AUGUST 2026</p><h1>Rider Overview</h1><p>Stay on top of your route, deliveries, and earnings.</p></div><button className={`rider-location-button ${sharingLocation ? "is-sharing" : ""}`} onClick={toggleLocation}><LocateFixed size={16} />{sharingLocation ? "Location sharing on" : "Share my location"}</button></div>
        {(error || actionError) && <div className="rider-alert"><AlertCircle size={17} />{error || actionError}</div>}
        <div className="stats-grid rider-stats"><StatCard title="Active delivery" value={stats.active ?? (delivery ? 1 : 0)} icon={<Truck size={20} />} /><StatCard title="Completed today" value={stats.completedToday || 0} icon={<CheckCircle2 size={20} />} /><StatCard title="Today's earnings" value={`KES ${Number(earnings).toLocaleString()}`} icon={<CircleDollarSign size={20} />} /><StatCard title="Rider status" value={profile?.availability === "on_delivery" ? "On route" : "Available"} icon={<Bike size={20} />} /></div>
        <div className="rider-grid">
          <section className="rider-panel rider-delivery-panel"><div className="rider-panel-heading"><div><h2>Current delivery</h2><p>Your next stop, pickup to doorstep.</p></div><StatusBadge status={status} /></div>{delivery ? <><div className="delivery-hero"><div className="delivery-number"><span>DELIVERY</span><strong>#{delivery.id}</strong></div><div className="delivery-time"><Clock3 size={16} /> Today</div></div><div className="route-steps"><div className="route-step"><span className="route-icon pickup"><Package size={17} /></span><div><small>Pickup information</small><strong>{delivery.pickupName || "Reflex pickup hub"}</strong><p>{delivery.pickupAddress || "12 Market Road, Central"}</p></div></div><div className="route-line" /><div className="route-step"><span className="route-icon dropoff"><MapPin size={17} /></span><div><small>Customer / drop-off</small><strong>{delivery.customerName || delivery.customer_name || "Customer"}</strong><p>{delivery.address || "Drop-off address pending"}</p></div></div></div><div className="delivery-detail-strip"><div><small>Package</small><strong>{delivery.packageInfo || "Standard parcel"}</strong></div><div><small>Customer phone</small><strong>{delivery.customerPhone || "+254 700 000 000"}</strong></div><div><small>Distance</small><strong>{delivery.distance || "2.4 km"}</strong></div></div>{handoffConfirmed && <div className="handoff-success"><CheckCircle2 size={18} /> Successful handoff confirmed</div>}<div className="rider-actions">{nextStatus && <button className="primary-action" onClick={() => updateStatus(nextStatus)} disabled={actionLoading}><CheckCircle2 size={16} />{actionLoading === nextStatus ? "Updating..." : nextLabel}</button>}{!handoffConfirmed && <button className="outline-action" onClick={confirmHandoff} disabled={actionLoading === "scan"}><ScanLine size={16} />{actionLoading === "scan" ? "Confirming..." : "Scan & confirm handoff"}</button>}</div></> : <div className="empty-delivery"><Truck size={34} /><strong>No active delivery</strong><p>New assignments will appear here.</p></div>}</section>
          <aside className="rider-side-stack"><section className="rider-panel status-panel"><div className="rider-panel-heading"><div><h2>Availability</h2><p>Let dispatch know your status.</p></div><span className="status-live"><span className="online-dot" /> Live</span></div><div className="availability-card"><div className="rider-avatar-large"><Bike size={22} /></div><div><strong>{profile?.name || "Demo Rider"}</strong><p>{profile?.vehicleType || "Motorbike"} · {profile?.phone || "No phone added"}</p></div></div><div className="availability-options"><button className={profile?.availability !== "on_delivery" ? "selected" : ""} onClick={() => setProfile((current) => ({ ...current, availability: "available" }))}><span className="availability-dot available" />Available</button><button className={profile?.availability === "on_delivery" ? "selected" : ""} onClick={() => setProfile((current) => ({ ...current, availability: "on_delivery" }))}><span className="availability-dot busy" />On delivery</button></div></section><section className="rider-panel location-panel"><div className="rider-panel-heading"><div><h2>Location updates</h2><p>GPS status while on delivery.</p></div><LocateFixed size={18} /></div><div className="location-readout"><MapPin size={17} /><div><strong>{sharingLocation ? "Location is being shared" : "Location is paused"}</strong><small>{location || "Enable GPS to simulate updates"}</small></div></div><button className="text-action rider-location-action" onClick={toggleLocation}>{sharingLocation ? "Stop sharing" : "Start location updates"}<ChevronRight size={14} /></button></section></aside>
        </div>
        <section className="rider-panel rider-tools-panel"><div className="rider-panel-heading"><div><h2>Rider tools</h2><p>Everything you need for the next handoff.</p></div></div><div className="rider-tool-grid"><button onClick={() => onNavigate("deliveries")}><History size={19} /><span><strong>My deliveries</strong><small>Assigned and completed jobs</small></span><ChevronRight size={16} /></button><button onClick={confirmHandoff}><QrCode size={19} /><span><strong>Scan QR code</strong><small>Confirm a successful handoff</small></span><ChevronRight size={16} /></button><button onClick={() => onNavigate("profile")}><User size={19} /><span><strong>My profile</strong><small>Update rider details</small></span><ChevronRight size={16} /></button></div></section>
      </div>
    </main>
  </div>;
}
