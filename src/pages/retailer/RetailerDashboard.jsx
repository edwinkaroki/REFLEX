import { useEffect, useState } from "react";
import { Building2, PackagePlus, RefreshCw, Search, X } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatCard from "../../components/dispatcher/StatCard";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import { createDelivery, getDelivery, getRetailerDeliveries, getRetailerProfile, updateRetailerProfile } from "../../services/retailerApi";

const emptyDelivery = { customer_name: "", customer_phone: "", address: "", package_description: "", delivery_notes: "" };
const statuses = ["all", "pending", "assigned", "picked_up", "out_for_delivery", "delivered", "failed"];

function readToken() {
  const token = localStorage.getItem("access_token");
  if (!token) console.warn("No access token found.");
  return token;
}

export default function RetailerDashboard({ role, setRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ business_name: "", contact_name: "", phone: "", email: "" });
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryForm, setDeliveryForm] = useState(emptyDelivery);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  async function loadDashboard() {
    const token = readToken();
    if (!token) {
      setLoading(false);
      setError("Sign in to load your retailer dashboard.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [profileResponse, deliveriesResponse] = await Promise.all([getRetailerProfile(token), getRetailerDeliveries(token)]);
      setProfile(profileResponse);
      setProfileForm({ business_name: profileResponse.business_name || "", contact_name: profileResponse.contact_name || "", phone: profileResponse.phone || "", email: profileResponse.email || "" });
      setDeliveries(Array.isArray(deliveriesResponse) ? deliveriesResponse : deliveriesResponse.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load your retailer dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    const token = readToken();
    if (!token) return setError("Sign in before updating your profile.");
    setSavingProfile(true);
    setError("");
    try {
      const updatedProfile = await updateRetailerProfile(profileForm, token);
      setProfile(updatedProfile);
    } catch (requestError) {
      setError(requestError.message || "Unable to update your profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeliverySubmit(event) {
    event.preventDefault();
    const token = readToken();
    if (!token) return setError("Sign in before creating a delivery.");
    setSubmitting(true);
    setError("");
    setSubmitMessage("");
    try {
      const createdDelivery = await createDelivery(deliveryForm, token);
      setDeliveries((previous) => [createdDelivery, ...previous]);
      setDeliveryForm(emptyDelivery);
      setSubmitMessage("Delivery request created successfully. It is now waiting for dispatch.");
    } catch (requestError) {
      setError(requestError.message || "Unable to create delivery. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function openDetails(delivery) {
    const token = readToken();
    if (!token) return setError("Sign in to view delivery details.");
    setSelectedDelivery({ loading: true });
    try {
      setSelectedDelivery(await getDelivery(delivery.id, token));
    } catch (requestError) {
      setSelectedDelivery(null);
      setError(requestError.message || "Unable to load delivery details. Please try again.");
    }
  }

  const filteredDeliveries = deliveries.filter((delivery) => {
    const text = `${delivery.id} ${delivery.customer_name || ""} ${delivery.address || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || delivery.status === statusFilter);
  });
  const count = (status) => deliveries.filter((delivery) => delivery.status === status).length;

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar role={role} setRole={setRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="md:ml-64">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Retailer overview</strong></div><div className="topbar-actions"><strong>Retailer view</strong><button className="mobile-menu" onClick={() => setMobileOpen(true)}>Menu</button></div></header>
        <div className="dashboard-content retailer-dashboard">
          <section className="page-intro"><div><p className="date-label">RETAILER WORKSPACE</p><h1>Delivery Overview</h1><p className="text-muted">Create delivery requests and monitor their progress.</p></div></section>
          {error && <div className="api-alert error-alert"><strong>Unable to connect</strong><span>{error}</span><button onClick={loadDashboard}><RefreshCw size={14} /> Try again</button></div>}
          {loading ? <div className="api-state">Loading retailer dashboard...</div> : <>
            <section className="retailer-summary"><StatCard title="Total deliveries" value={deliveries.length} icon={<PackagePlus />} /><StatCard title="Pending" value={count("pending")} icon={<RefreshCw />} /><StatCard title="Active" value={count("out_for_delivery") + count("assigned") + count("picked_up")} icon={<PackagePlus />} /><StatCard title="Delivered" value={count("delivered")} icon={<Building2 />} /><StatCard title="Failed" value={count("failed")} icon={<X />} /></section>
            <section className="retailer-columns">
              <article className="panel retailer-profile-panel"><div className="panel-heading"><div><h3>Business profile</h3><p>Information returned by the API</p></div></div>{profile ? <form className="retailer-form" onSubmit={handleProfileSubmit}><label>Business name<input value={profileForm.business_name} onChange={(event) => setProfileForm({ ...profileForm, business_name: event.target.value })} /></label><label>Contact person<input value={profileForm.contact_name} onChange={(event) => setProfileForm({ ...profileForm, contact_name: event.target.value })} /></label><label>Phone number<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} /></label><label>Email<input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} /></label><button className="primary-button" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save profile"}</button></form> : <div className="api-state">No retailer profile found.</div>}</article>
              <article className="panel retailer-create-panel"><div className="panel-heading"><div><h3>Create delivery request</h3><p>The dispatcher will receive it after API confirmation.</p></div></div><form className="retailer-form" onSubmit={handleDeliverySubmit}><label>Customer name<input required value={deliveryForm.customer_name} onChange={(event) => setDeliveryForm({ ...deliveryForm, customer_name: event.target.value })} /></label><label>Customer phone<input required value={deliveryForm.customer_phone} onChange={(event) => setDeliveryForm({ ...deliveryForm, customer_phone: event.target.value })} /></label><label>Delivery address<input required value={deliveryForm.address} onChange={(event) => setDeliveryForm({ ...deliveryForm, address: event.target.value })} /></label><label>Package/order description<input required value={deliveryForm.package_description} onChange={(event) => setDeliveryForm({ ...deliveryForm, package_description: event.target.value })} /></label><label>Delivery notes<textarea value={deliveryForm.delivery_notes} onChange={(event) => setDeliveryForm({ ...deliveryForm, delivery_notes: event.target.value })} /></label><button className="primary-button" disabled={submitting}><PackagePlus size={16} /> {submitting ? "Submitting..." : "Submit delivery request"}</button>{submitMessage && <p className="form-success-message">{submitMessage}</p>}</form></article>
            </section>
            <section className="panel retailer-deliveries-panel"><div className="panel-heading"><div><h3>My deliveries</h3><p>Only deliveries returned for the authenticated retailer</p></div></div><div className="retailer-table-tools"><div className="search-box"><Search size={15} /><input placeholder="Search deliveries..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="filter-button" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status.replace(/_/g, " ")}</option>)}</select></div>{filteredDeliveries.length === 0 ? <div className="api-state">{deliveries.length === 0 ? "No deliveries found." : "No deliveries match your filters."}</div> : <div className="retailer-table-wrap"><table className="retailer-table"><thead><tr><th>Delivery</th><th>Customer</th><th>Address</th><th>Package</th><th>Rider</th><th>Status</th><th /></tr></thead><tbody>{filteredDeliveries.map((delivery) => <tr key={delivery.id} onClick={() => openDetails(delivery)}><td><strong>{delivery.id}</strong><small>{delivery.created_at || delivery.createdAt || "Date unavailable"}</small></td><td>{delivery.customer_name || "Not provided"}</td><td>{delivery.address || "Not provided"}</td><td>{delivery.package_description || delivery.details || "Not provided"}</td><td>{delivery.rider?.name || delivery.rider_name || "Unassigned"}</td><td><StatusBadge status={delivery.status} /></td><td><button className="row-view" onClick={(event) => { event.stopPropagation(); openDetails(delivery); }}>View</button></td></tr>)}</tbody></table></div>}</section>
          </>}
        </div>
      </main>
      {selectedDelivery && !selectedDelivery.loading && <div className="modal-backdrop"><div className="detail-modal"><div className="modal-heading"><div><h3>Delivery details</h3><p>{selectedDelivery.id}</p></div><button onClick={() => setSelectedDelivery(null)}><X size={18} /></button></div><div className="detail-grid"><span>Customer<strong>{selectedDelivery.customer_name || "Not provided"}</strong></span><span>Phone<strong>{selectedDelivery.customer_phone || "Not provided"}</strong></span><span>Address<strong>{selectedDelivery.address || "Not provided"}</strong></span><span>Package<strong>{selectedDelivery.package_description || selectedDelivery.details || "Not provided"}</strong></span><span>Status<StatusBadge status={selectedDelivery.status} /></span><span>Rider<strong>{selectedDelivery.rider?.name || selectedDelivery.rider_name || "Unassigned"}</strong></span><span>Created<strong>{selectedDelivery.created_at || "Not provided"}</strong></span><span>Updated<strong>{selectedDelivery.updated_at || "Not provided"}</strong></span></div>{selectedDelivery.failure_reason && <div className="failure-note">{selectedDelivery.failure_reason}</div>}</div></div>}
    </div>
  );
}
