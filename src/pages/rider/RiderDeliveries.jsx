import { useEffect, useState } from "react";
import {
  Truck,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import { getMyDeliveries } from "../../services/riderApi";

export default function RiderDeliveries({ role, setRole, onNavigate }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, delivered, failed, pending

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    loadDeliveries();
  }, [token, filter]);

  async function loadDeliveries() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== "all") {
        params.status = filter;
      }
      const res = await getMyDeliveries(token, params);
      setDeliveries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load deliveries:", err);
      setError("Failed to load delivery history");
    } finally {
      setLoading(false);
    }
  }

  const statusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Truck className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} setRole={setRole} onNavigate={onNavigate} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => onNavigate?.("dashboard")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Delivery History
              </h1>
              <p className="text-gray-600">
                View all your past and current deliveries
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {["all", "delivered", "failed", "pending"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
                <button
                  onClick={loadDeliveries}
                  className="text-sm mt-1 text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 mx-auto mb-2 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading deliveries...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && deliveries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <Truck className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 font-medium">No deliveries found</p>
              <p className="text-sm text-gray-500">
                {filter === "all"
                  ? "You haven't completed any deliveries yet"
                  : `No ${filter} deliveries at this time`}
              </p>
            </div>
          )}

          {/* Deliveries List */}
          {!loading && deliveries.length > 0 && (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {statusIcon(delivery.status)}
                        <div>
                          <p className="font-mono text-sm text-gray-600">
                            ID: {delivery.id}
                          </p>
                          <p className="font-semibold">
                            {delivery.customerName || "Customer"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {delivery.address && (
                          <div>
                            <p className="text-xs text-gray-600 uppercase">
                              Address
                            </p>
                            <p className="text-sm">{delivery.address}</p>
                          </div>
                        )}

                        {delivery.customerPhone && (
                          <div>
                            <p className="text-xs text-gray-600 uppercase">
                              Phone
                            </p>
                            <p className="text-sm">{delivery.customerPhone}</p>
                          </div>
                        )}

                        {delivery.deliveredAt && (
                          <div>
                            <p className="text-xs text-gray-600 uppercase">
                              Delivered
                            </p>
                            <p className="text-sm">
                              {new Date(delivery.deliveredAt).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {delivery.createdAt && (
                          <div>
                            <p className="text-xs text-gray-600 uppercase">
                              Assigned
                            </p>
                            <p className="text-sm">
                              {new Date(delivery.createdAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <StatusBadge status={delivery.status} />
                    </div>
                  </div>

                  {delivery.failureReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs text-red-600 font-semibold">
                        Failure Reason
                      </p>
                      <p className="text-sm text-red-700">
                        {delivery.failureReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}