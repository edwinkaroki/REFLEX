import { useEffect, useState } from "react";
import {
  Bell,
  ArrowLeft,
  Loader,
  AlertCircle,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import { getMyNotifications } from "../../services/riderApi";

export default function RiderNotifications({ role, setRole, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    loadNotifications();
  }, [token]);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyNotifications(token);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "delivery_assigned":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "delivery_updated":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "delivery_failed":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "delivery_assigned":
        return "bg-blue-50 border-blue-200";
      case "delivery_updated":
        return "bg-green-50 border-green-200";
      case "delivery_failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} setRole={setRole} onNavigate={onNavigate} />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
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
                Notifications
              </h1>
              <p className="text-gray-600">
                Updates about your deliveries and assignments
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
                <button
                  onClick={loadNotifications}
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
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && notifications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-500">
                You will see delivery updates and assignments here
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && notifications.length > 0 && (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {notification.title || "Notification"}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {notification.message}
                      </p>

                      {notification.deliveryId && (
                        <p className="text-xs text-gray-600 mt-2 font-mono">
                          Delivery: {notification.deliveryId}
                        </p>
                      )}

                      {notification.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {notification.read === false && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}