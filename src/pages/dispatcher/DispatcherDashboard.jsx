import {
  getDeliveries,
  getRiders,
  assignRider as assignRiderApi,
} from "../../services/api";
// Uncomment the following lines if you have a WebSocket service implemented
 //import {
	//connectWebSocket,
//	disconnectWebSocket,
//} from "../../services/websocket";

import { useEffect, useState } from "react";
import { ArrowRight, Bell, Bike, CheckCircle2, Clock3, Package, Search, Truck, UserRound, X, Users } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatCard from "../../components/dispatcher/StatCard";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import DeliveryTable from "../../components/dispatcher/DeliveryTable";


export default function DispatcherDashboard({ role, setRole, activePage = "dashboard", setActivePage = () => {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryView, setDeliveryView] = useState("incoming");
  const [showAllDeliveries, setShowAllDeliveries] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [detailDelivery, setDetailDelivery] = useState(null);
  const [riderSearch, setRiderSearch] = useState("");
  const [riderFilter, setRiderFilter] = useState("all");
  const [detailRider, setDetailRider] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notifications = [];
  const active = deliveries.filter((delivery) =>
  ["assigned", "picked_up", "in_transit"].includes(delivery.status)
).length;

const outForDelivery = deliveries.filter(
  (delivery) => delivery.status === "in_transit"
).length;

const delivered = deliveries.filter(
  (delivery) => delivery.status === "delivered"
).length;

const pending = deliveries.filter(
  (delivery) => delivery.status === "pending"
).length;

const cancelled = deliveries.filter(
  (delivery) => delivery.status === "cancelled"
).length;
  const filtered = deliveries.filter((delivery) => {
    const matchesSearch =
  `${delivery.id} ${delivery.pickup_address} ${delivery.dropoff_address}`.toLowerCase().includes(search.toLowerCase());
    const matchesView = deliveryView === "all" || (deliveryView === "incoming" && delivery.status === "pending") || (deliveryView === "active" &&
  ["assigned", "picked_up", "in_transit"].includes(delivery.status)) ||
(deliveryView === "completed" &&
  ["delivered", "cancelled"].includes(delivery.status));
    return matchesSearch && matchesView && (statusFilter === "all" || delivery.status === statusFilter);
  });
  const visibleDeliveries = showAllDeliveries ? filtered : filtered.slice(0, 4);
  const filteredRiders = riders.filter((rider) => (riderFilter === "all" || rider.status === riderFilter) && `${rider.name} ${rider.location}`.toLowerCase().includes(riderSearch.toLowerCase()));
// websock effect (uncomment if you have a WebSocket service implemented)
// useEffect(() => {
	//const socket = connectWebSocket((message) => {
	//	switch (message.event) {
		//	case "delivery_status_changed":
				//console.log("Delivery status changed:", message.data);
				//break;

		//	case "rider_location_updated":
			//	console.log("Rider location updated:", message.data);
		//		break;

		//	case "delivery_assigned":
			//	console.log("Delivery assigned:", message.data);
			//	break;

			//default:
			//	console.log("Unknown WebSocket event:", message.event);
	//	}
	//});

	//return () => {
	//	if (socket) {
	//		disconnectWebSocket();
//	}
//	};
//} []);
//Assign rider to delivery
 async function assignRider(riderId, delivery = selectedDelivery) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No access token found.");
    return;
  }

  if (!delivery) {
    console.error("No delivery selected.");
    return;
  }

  try {
      // TODO(backend): use the confirmed assignment response or refetch if local state is not authoritative.
    const assignment = await assignRiderApi(
      delivery.id,
      riderId,
      token
    );

    console.log("Rider assigned successfully:", assignment);

    setDeliveries((previous) =>
      previous.map((item) =>
        item.id === delivery.id
          ? {
              ...item,
              rider_id: riderId,
              status: "assigned",
            }
          : item
      )
    );

    setRiders((previous) =>
      previous.map((rider) =>
        rider.id === riderId
          ? {
              ...rider,
              status: "busy",
              active_delivery_id: delivery.id,
            }
          : rider
      )
    );

    setSelectedDelivery(null);
  } catch (error) {
    console.error("Failed to assign rider:", error);
  }
}
// Automatically assign the nearest available rider to a delivery
async function autoAssign(delivery) {
  const availableRider = riders.find(
    (rider) => rider.status === "available"
  );

  if (!availableRider) {
    console.warn("No available riders.");
    return;
  }

  await assignRider(availableRider.id, delivery);
}
 
//access token
useEffect(() => {
  async function loadDashboard() {
    try {
      const deliveryData = await getDeliveries();
      console.log("🔥 DELIVERIES FROM API:", deliveryData);

      const riderData = await getRiders();
      console.log("🔥 RIDERS FROM API:", riderData);

      setDeliveries(
        Array.isArray(deliveryData) ? deliveryData : []
      );

      setRiders(
        Array.isArray(riderData) ? riderData : []
      );
    } catch (error) {
      console.error("🔥 DASHBOARD REQUEST FAILED:", error);
    }
  }

  loadDashboard();
}, []);

return (
  <div className="min-h-screen bg-canvas">
    <Sidebar
      role={role}
      setRole={setRole}
      activePage={activePage}
      onNavigate={setActivePage}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    />

    <main className="md:ml-64">
      <header className="topbar">
        <div className="breadcrumbs">
          <span>Workspace</span>
          <b>/</b>
          <strong>Overview</strong>
        </div>

        <div className="topbar-actions">
          <UserRound size={16} />
          <strong>Dispatcher view</strong>
          <span className="topbar-chevron">⌄</span>

          <button
            className="notification"
            onClick={() =>
              setNotificationOpen((previous) => !previous)
            }
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && <i />}
          </button>

          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>

          {notificationOpen && (
            <div className="notification-popover">
              <strong>Notifications</strong>

              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                notifications.slice(0, 4).map((delivery) => (
                  <button
                    key={delivery.id}
                    onClick={() => {
                      setDeliveryView("incoming");
                      setShowAllDeliveries(true);
                      setNotificationOpen(false);
                    }}
                  >
                    <span className="notification-dot" />

                    <span>
                      <b>New delivery</b>
                      <small>{delivery.id}</small>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-content">
        <section className="page-intro">
          <div>
            <p className="date-label">DISPATCHER WORKSPACE</p>
            <h1>Delivery Overview</h1>
            <p className="text-muted">
              Monitor deliveries and assign available riders.
            </p>
          </div>
        </section>

        {activePage === "dashboard" && (
          <section className="stats-grid">
            <StatCard
              title="Active deliveries"
              value={String(active).padStart(2, "0")}
              icon={<Package />}
            />

            <StatCard
              title="Out for delivery"
              value={String(outForDelivery).padStart(2, "0")}
              icon={<Truck />}
            />

            <StatCard
              title="Delivered"
              value={String(delivered).padStart(2, "0")}
              icon={<Bike />}
            />

            <StatCard
              title="Pending"
              value={String(pending).padStart(2, "0")}
              icon={<Clock3 />}
            />
          </section>
        )}

        {(activePage === "dashboard" || activePage === "deliveries") && (
          <section className="overview-grid">
          <article className="panel deliveries-panel">
            <div className="panel-heading">
              <div>
                <h3>Deliveries</h3>
                <p>Delivery records from the backend</p>
              </div>

              <button
                className="text-action"
                onClick={() =>
                  setShowAllDeliveries((previous) => !previous)
                }
              >
                {showAllDeliveries ? "Show less" : "View all"}
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="delivery-tabs">
              {[
                ["active", "Active"],
                ["incoming", "Incoming"],
                ["completed", "Completed"],
                ["all", "All"],
              ].map(([value, label]) => (
                <button
                  className={
                    deliveryView === value ? "selected" : ""
                  }
                  key={value}
                  onClick={() => {
                    setDeliveryView(value);
                    setShowAllDeliveries(true);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="table-tools">
              <div className="search-box">
                <Search size={16} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search deliveries..."
                />
              </div>

              <select
                className="filter-button"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked up</option>
                <option value="in_transit">In transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="delivery-table-header">
              <span>Order</span>
              <span>Customer</span>
              <span>Package</span>
              <span>Rider</span>
              <span>Status</span>
              <span />
            </div>

            <DeliveryTable
              deliveries={visibleDeliveries}
              riders={riders}
              onAssign={setSelectedDelivery}
              onView={setDetailDelivery}
            />
          </article>

          {/* BACKEND-DRIVEN DELIVERY SUMMARY */}
          <div className="side-panels">
            <article className="panel attention-panel">
              <div className="panel-heading">
                <div>
                  <h3>Pending deliveries</h3>
                  <p>Deliveries waiting for assignment</p>
                </div>

                <span className="alert-count">
                  {pending}
                </span>
              </div>

              {deliveries
                .filter(
                  (delivery) => delivery.status === "pending"
                )
                .slice(0, 3)
                .map((delivery) => (
                  <button
                    className="attention-item"
                    key={delivery.id}
                    onClick={() => setSelectedDelivery(delivery)}
                  >
                    <span className="attention-icon clock">
                      <Clock3 size={17} />
                    </span>

                    <div>
                      <strong>
                        Delivery #{delivery.id}
                      </strong>

                      <small>
                        {delivery.pickup_address || "Pickup unavailable"}
                      </small>
                    </div>

                    <ArrowRight size={16} />
                  </button>
                ))}

              {pending === 0 && (
                <p className="text-muted">
                  No pending deliveries.
                </p>
              )}
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h3>Delivery summary</h3>
                  <p>Current backend delivery status</p>
                </div>
              </div>

              <div className="activity-item">
                <span className="activity-dot" />

                <div>
                  <small>Pending</small>
                  <strong>{pending}</strong>
                  <span>Waiting for rider assignment</span>
                </div>
              </div>

              <div className="activity-item">
                <span className="activity-dot green" />

                <div>
                  <small>Active</small>
                  <strong>{active}</strong>
                  <span>Currently assigned or in progress</span>
                </div>
              </div>

              <div className="activity-item">
                <span className="activity-dot orange" />

                <div>
                  <small>Delivered</small>
                  <strong>{delivered}</strong>
                  <span>Completed deliveries</span>
                </div>
              </div>
            </article>
          </div>
          </section>
        )}

        {activePage === "dashboard" && (
          <>
            <section className="operations-grid">
              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Rider management</h3>
                    <p>Riders returned by the API</p>
                  </div>

                  <Users
                    size={18}
                    className="panel-icon"
                  />
                </div>

                <div className="rider-tools">
                  <div className="search-box">
                    <Search size={15} />

                    <input
                      value={riderSearch}
                      onChange={(event) =>
                        setRiderSearch(event.target.value)
                      }
                      placeholder="Search riders..."
                    />
                  </div>

                  <select
                    className="filter-button"
                    value={riderFilter}
                    onChange={(event) =>
                      setRiderFilter(event.target.value)
                    }
                  >
                    <option value="all">All riders</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div className="management-list">
                  {filteredRiders.map((rider) => (
                    <button
                      className="management-row"
                      key={rider.id}
                      onClick={() => setDetailRider(rider)}
                    >
                      <span className="rider-avatar">
                        {rider.name?.charAt(0) || "R"}
                      </span>

                      <div>
                        <strong>
                          {rider.name || "Unknown rider"}
                        </strong>

                        <small>
                          {rider.vehicle_type || "Vehicle unavailable"}
                        </small>
                      </div>

                      <StatusBadge status={rider.status} />
                    </button>
                  ))}
                </div>

                {filteredRiders.length === 0 && (
                  <p className="text-muted">
                    No riders returned by the API.
                  </p>
                )}
              </article>
            </section>

            <section className="panel history-panel">
              <div className="panel-heading">
                <div>
                  <h3>Delivery history</h3>
                  <p>Completed and cancelled delivery records</p>
                </div>

                <span className="history-summary">
                  <CheckCircle2 size={14} />
                  {delivered} delivered
                  {" · "}
                  {cancelled} cancelled
                </span>
              </div>

              <div className="history-list">
                {deliveries
                  .filter((delivery) =>
                    ["delivered", "cancelled"].includes(
                      delivery.status
                    )
                  )
                  .map((delivery) => (
                    <div
                      className="history-row"
                      key={delivery.id}
                    >
                      <strong>#{delivery.id}</strong>

                      <span>
                        {delivery.customer_name ||
                          "Customer"}
                      </span>

                      <span>
                        {delivery.dropoff_address ||
                          "Dropoff unavailable"}
                      </span>

                      <StatusBadge status={delivery.status} />

                      <button
                        className="row-view"
                        onClick={() =>
                          setDetailDelivery(delivery)
                        }
                      >
                        View
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ))}
              </div>

              {deliveries.filter((delivery) =>
                ["delivered", "cancelled"].includes(
                  delivery.status
                )
              ).length === 0 && (
                <p className="text-muted">
                  No completed delivery records returned by the API.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>

    {/* ASSIGN RIDER MODAL */}
    {selectedDelivery && (
      <div className="modal-backdrop">
        <div className="assign-modal">
          <div className="modal-heading">
            <div>
              <h3>Assign rider</h3>
              <p>
                Delivery #{selectedDelivery.id}
              </p>
            </div>

            <button
              onClick={() => setSelectedDelivery(null)}
            >
              <X size={18} />
            </button>
          </div>

          <button
            className="auto-assign-button"
            onClick={() =>
              autoAssign(selectedDelivery)
            }
          >
            Auto-assign available rider
          </button>

          {riders
            .filter(
              (rider) => rider.status === "available"
            )
            .map((rider) => (
              <button
                className="rider-option"
                key={rider.id}
                onClick={() =>
                  assignRider(
                    rider.id,
                    selectedDelivery
                  )
                }
              >
                <span className="rider-avatar">
                  {rider.name?.charAt(0) || "R"}
                </span>

                <span>
                  {rider.name || "Unknown rider"}
                </span>

                <StatusBadge status={rider.status} />
              </button>
            ))}

          {riders.filter(
            (rider) => rider.status === "available"
          ).length === 0 && (
            <p className="text-muted">
              No available riders returned by the API.
            </p>
          )}
        </div>
      </div>
    )}

    {/* DELIVERY DETAILS */}
    {detailDelivery && (
      <div className="modal-backdrop">
        <div className="detail-modal">
          <div className="modal-heading">
            <div>
              <h3>Delivery details</h3>

              <p>
                #{detailDelivery.id}
              </p>
            </div>

            <button
              onClick={() => setDetailDelivery(null)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="detail-grid">
            <span>
              Pickup
              <strong>
                {detailDelivery.pickup_address ||
                  "Not provided"}
              </strong>
            </span>

            <span>
              Dropoff
              <strong>
                {detailDelivery.dropoff_address ||
                  "Not provided"}
              </strong>
            </span>

            <span>
              Status
              <StatusBadge
                status={detailDelivery.status}
              />
            </span>

            <span>
              Rider
              <strong>
                {riders.find(
                  (rider) =>
                    rider.id ===
                    detailDelivery.rider_id
                )?.name || "Unassigned"}
              </strong>
            </span>

            <span>
              Created
              <strong>
                {detailDelivery.created_at || "Unknown"}
              </strong>
            </span>

            <span>
              Updated
              <strong>
                {detailDelivery.updated_at || "Unknown"}
              </strong>
            </span>
          </div>

          {detailDelivery.status === "pending" && (
            <div style={{ marginTop: "1rem" }}>
              <button
                className="assign-button"
                onClick={() => {
                  setSelectedDelivery(detailDelivery);
                  setDetailDelivery(null);
                }}
              >
                Assign rider
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* RIDER DETAILS */}
    {detailRider && (
      <div className="modal-backdrop">
        <div className="detail-modal">
          <div className="modal-heading">
            <div>
              <h3>Rider details</h3>
              <p>Rider information from the API</p>
            </div>

            <button
              onClick={() => setDetailRider(null)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="rider-detail-head">
            <span className="large-rider-avatar">
              {detailRider.name?.charAt(0) || "R"}
            </span>

            <div>
              <strong>
                {detailRider.name || "Unknown rider"}
              </strong>

              <p>
                {detailRider.phone || "Phone unavailable"}
              </p>
            </div>

            <StatusBadge status={detailRider.status} />
          </div>

          <div className="detail-grid">
            <span>
              Vehicle
              <strong>
                {detailRider.vehicle_type ||
                  "Not provided"}
              </strong>
            </span>

            <span>
              Status
              <StatusBadge
                status={detailRider.status}
              />
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

