import { useEffect, useState } from "react";
import { Building2, PackagePlus, RefreshCw, Search, X } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatCard from "../../components/dispatcher/StatCard";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import { createDelivery, getDelivery, getRetailerDeliveries, getRetailerProfile, updateRetailerProfile } from "../../services/retailerApi";

const emptyDelivery = {
  pickup_address: "",
  dropoff_address: ""
};

const statuses = [
  "all",
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled"
];

function readToken() {
  const token = localStorage.getItem("access_token");
  if (!token) console.warn("No access token found.");
  return token;
}

export default function RetailerDashboard({ role, setRole, activePage = "dashboard", setActivePage = () => {} }) {
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
      const nextDeliveries = Array.isArray(deliveriesResponse) ? deliveriesResponse : Array.isArray(deliveriesResponse?.items) ? deliveriesResponse.items : [];
      setDeliveries(nextDeliveries);
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
    const text = `${delivery.id || ""} ${delivery.pickup_address || ""} ${delivery.dropoff_address || ""} ${delivery.status || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || delivery.status === statusFilter);
  });
  const count = (status) => deliveries.filter((delivery) => delivery.status === status).length;
  const activeStatusSet = new Set(["assigned", "picked_up", "in_transit"]);

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar role={role} setRole={setRole} activePage={activePage} onNavigate={setActivePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="md:ml-64">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Retailer overview</strong></div><div className="topbar-actions"><strong>Retailer view</strong><button className="mobile-menu" onClick={() => setMobileOpen(true)}>Menu</button></div></header>
        <div className="dashboard-content retailer-dashboard">
          <section className="page-intro"><div><p className="date-label">RETAILER WORKSPACE</p><h1>Delivery Overview</h1><p className="text-muted">Create delivery requests and monitor their progress.</p></div></section>
          {error && <div className="api-alert error-alert"><strong>Unable to connect</strong><span>{error}</span><button onClick={loadDashboard}><RefreshCw size={14} /> Try again</button></div>}
          {loading ? <div className="api-state">Loading retailer dashboard...</div> : <>
            {activePage === "dashboard" && (
              <>
                <section className="retailer-summary"><StatCard title="Total deliveries" value={deliveries.length} icon={<PackagePlus />} /><StatCard title="Pending" value={count("pending")} icon={<RefreshCw />} /><StatCard title="Active" value={deliveries.filter((delivery) => activeStatusSet.has(delivery.status)).length} icon={<PackagePlus />} /><StatCard title="Delivered" value={count("delivered")} icon={<Building2 />} /><StatCard title="Failed" value={count("failed")} icon={<X />} /></section>

                <section className="retailer-columns">

  {/* BUSINESS PROFILE */}
  <article className="panel retailer-profile-panel">
    <div className="panel-heading">
      <div>
        <h3>Business profile</h3>
        <p>Information returned by the API</p>
      </div>
    </div>

    {profile ? (
      <form
        className="retailer-form"
        onSubmit={handleProfileSubmit}
      >
        <label>
          Business name
          <input
            value={profileForm.business_name}
            onChange={(event) =>
              setProfileForm({
                ...profileForm,
                business_name: event.target.value,
              })
            }
          />
        </label>

        <label>
          Contact person
          <input
            value={profileForm.contact_name}
            onChange={(event) =>
              setProfileForm({
                ...profileForm,
                contact_name: event.target.value,
              })
            }
          />
        </label>

        <label>
          Phone number
          <input
            value={profileForm.phone}
            onChange={(event) =>
              setProfileForm({
                ...profileForm,
                phone: event.target.value,
              })
            }
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) =>
              setProfileForm({
                ...profileForm,
                email: event.target.value,
              })
            }
          />
        </label>

        <button
          className="primary-button"
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save profile"}
        </button>
      </form>
    ) : (
      <div className="api-state">
        No retailer profile found.
      </div>
    )}
  </article>

  {/* CREATE DELIVERY */}
  <article className="panel retailer-create-panel">
    <div className="panel-heading">
      <div>
        <h3>Create delivery request</h3>
        <p>
          The dispatcher will receive it after API confirmation.
        </p>
      </div>
    </div>

    <form
      className="retailer-form"
      onSubmit={handleDeliverySubmit}
    >
      <label>
        Pickup address
        <input
          required
          value={deliveryForm.pickup_address}
          onChange={(event) =>
            setDeliveryForm({
              ...deliveryForm,
              pickup_address: event.target.value,
            })
          }
          placeholder="e.g. Westlands, Nairobi"
        />
      </label>

      <label>
        Dropoff address
        <input
          required
          value={deliveryForm.dropoff_address}
          onChange={(event) =>
            setDeliveryForm({
              ...deliveryForm,
              dropoff_address: event.target.value,
            })
          }
          placeholder="e.g. Kilimani, Nairobi"
        />
      </label>

      <button
        className="primary-button"
        disabled={submitting}
      >
        <PackagePlus size={16} />
        {submitting
          ? "Submitting..."
          : "Submit delivery request"}
      </button>

      {submitMessage && (
        <p className="form-success-message">
          {submitMessage}
        </p>
      )}
    </form>
  </article>

                </section>
              </>
            )}

            {activePage === "deliveries" && (
              <section className="panel retailer-deliveries-panel"><div className="panel-heading"><div><h3>My deliveries</h3><p>Only deliveries returned for the authenticated retailer</p></div></div><div className="retailer-table-tools"><div className="search-box"><Search size={15} /><input placeholder="Search deliveries..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="filter-button" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status.replace(/_/g, " ")}</option>)}</select></div>{filteredDeliveries.length === 0 ? <div className="api-state">{deliveries.length === 0 ? "No deliveries found." : "No deliveries match your filters."}</div> : <div className="retailer-table-wrap"><table className="retailer-table"><thead><tr><th>Delivery</th><th>Pickup</th><th>Dropoff</th><th>Customer</th><th>Rider</th><th>Status</th><th /></tr></thead><tbody>{filteredDeliveries.map((delivery) => <tr key={delivery.id} onClick={() => openDetails(delivery)}><td><strong>{delivery.id}</strong><small>{delivery.created_at || delivery.createdAt || "Date unavailable"}</small></td><td>{delivery.pickup_address || "Not provided"}</td><td>{delivery.dropoff_address || "Not provided"}</td><td>{delivery.customer_name || "Not provided"}</td><td>{delivery.rider?.name || delivery.rider_name || "Unassigned"}</td><td><StatusBadge status={delivery.status} /></td><td><button className="row-view" onClick={(event) => { event.stopPropagation(); openDetails(delivery); }}>View</button></td></tr>)}</tbody></table></div>}</section>
            )}

            {activePage === "new-delivery" && (
              <section className="panel retailer-create-panel" style={{ marginTop: "1rem" }}>
                <div className="panel-heading">
                  <div>
                    <h3>Create delivery request</h3>
                    <p>The dispatcher will receive it after API confirmation.</p>
                  </div>
                </div>

                <form className="retailer-form" onSubmit={handleDeliverySubmit}>
                  <label>
                    Pickup address
                    <input required value={deliveryForm.pickup_address} onChange={(event) => setDeliveryForm({ ...deliveryForm, pickup_address: event.target.value })} placeholder="e.g. Westlands, Nairobi" />
                  </label>

                  <label>
                    Dropoff address
                    <input required value={deliveryForm.dropoff_address} onChange={(event) => setDeliveryForm({ ...deliveryForm, dropoff_address: event.target.value })} placeholder="e.g. Kilimani, Nairobi" />
                  </label>

                  <button className="primary-button" disabled={submitting}>
                    <PackagePlus size={16} />
                    {submitting ? "Submitting..." : "Submit delivery request"}
                  </button>

                  {submitMessage && <p className="form-success-message">{submitMessage}</p>}
                </form>
              </section>
            )}
          </>}
        </div>
      </main>
      {selectedDelivery && !selectedDelivery.loading && <div className="modal-backdrop"><div className="detail-modal"><div className="modal-heading"><div><h3>Delivery details</h3><p>{selectedDelivery.id}</p></div><button onClick={() => setSelectedDelivery(null)}><X size={18} /></button></div><div className="detail-grid"><span>Pickup<strong>{selectedDelivery.pickup_address || "Not provided"}</strong></span><span>Dropoff<strong>{selectedDelivery.dropoff_address || "Not provided"}</strong></span><span>Customer<strong>{selectedDelivery.customer_name || "Not provided"}</strong></span><span>Rider<strong>{selectedDelivery.rider?.name || selectedDelivery.rider_name || "Unassigned"}</strong></span><span>Status<StatusBadge status={selectedDelivery.status} /></span><span>Created<strong>{selectedDelivery.created_at || "Not provided"}</strong></span><span>Updated<strong>{selectedDelivery.updated_at || "Not provided"}</strong></span></div>{selectedDelivery.failure_reason && <div className="failure-note">{selectedDelivery.failure_reason}</div>}</div></div>}
    </div>
  );
}
