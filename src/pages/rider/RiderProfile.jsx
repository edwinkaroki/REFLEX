import { useEffect, useState } from "react";
import {
  User,
  ArrowLeft,
  Loader,
  AlertCircle,
  Bike,
  Phone,
  MapPin,
  Shield,
} from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";
import StatusBadge from "../../components/dispatcher/StatusBadge";
import { getMyProfile, updateMyAvailability } from "../../services/riderApi";

export default function RiderProfile({ role, setRole, onNavigate, mobileOpen, setMobileOpen, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProfile();
  }, [token]);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyProfile(token);
      setProfile(res || null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvailabilityChange(newStatus) {
    setUpdateLoading(true);
    setUpdateError(null);
    setSuccessMessage(null);

    try {
      await updateMyAvailability(newStatus, token);
      // Update local state
      setProfile((prev) => ({
        ...prev,
        availability: newStatus,
      }));
      setSuccessMessage("Status updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update availability:", err);
      setUpdateError(
        err.message || "Failed to update your status. Try again."
      );
    } finally {
      setUpdateLoading(false);
    }
  }

  return (
    <div className="rider-shell rider-profile-shell">
      <Sidebar role={role} setRole={setRole} onNavigate={onNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={onLogout} />

      <main className="rider-main">
        <div className="rider-profile-content">
          {/* Header */}
          <div className="rider-profile-header">
            <button className="mobile-menu rider-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">Menu</button>
            <button
              onClick={() => onNavigate?.("dashboard")}
              className="outline-action rider-back-button"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <p className="rider-date">RIDER ACCOUNT</p>
              <h1>My Profile</h1>
              <p>Manage your rider information</p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
                <button
                  onClick={loadProfile}
                  className="text-sm mt-1 text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Update Error */}
          {updateError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{updateError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 mx-auto mb-2 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          )}

          {/* Profile Content */}
          {!loading && profile && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.id && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Rider ID
                      </label>
                      <p className="font-mono text-lg mt-1">{profile.id}</p>
                    </div>
                  )}

                  {profile.name && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Name
                      </label>
                      <p className="text-lg mt-1">{profile.name}</p>
                    </div>
                  )}

                  {profile.email && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Email
                      </label>
                      <p className="text-sm mt-1">{profile.email}</p>
                    </div>
                  )}

                  {profile.phone && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </label>
                      <p className="text-sm mt-1">{profile.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              {profile.vehicleType && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Bike className="w-5 h-5" />
                    Vehicle Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Vehicle Type
                      </label>
                      <p className="text-lg mt-1">{profile.vehicleType}</p>
                    </div>

                    {profile.vehicleRegistration && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Registration
                        </label>
                        <p className="font-mono text-lg mt-1">
                          {profile.vehicleRegistration}
                        </p>
                      </div>
                    )}

                    {profile.vehicleDetails && (
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Details
                        </label>
                        <p className="text-sm mt-1">{profile.vehicleDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Availability Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Availability
                </h2>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Current Status
                  </label>
                  <p className="mt-2">
                    <StatusBadge
                      status={profile.availability || "offline"}
                    />
                  </p>
                </div>

                <div className="flex gap-2">
                  {["available", "busy", "offline"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleAvailabilityChange(status)}
                      disabled={
                        updateLoading ||
                        profile.availability === status
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        profile.availability === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {updateLoading && (
                  <p className="text-sm text-gray-600 mt-2">Updating...</p>
                )}
              </div>

              {/* Location Information */}
              {profile.currentLocation && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Current Location
                  </h2>

                  {typeof profile.currentLocation === "object" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.currentLocation.latitude && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase">
                            Latitude
                          </label>
                          <p className="font-mono text-sm mt-1">
                            {profile.currentLocation.latitude}
                          </p>
                        </div>
                      )}
                      {profile.currentLocation.longitude && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase">
                            Longitude
                          </label>
                          <p className="font-mono text-sm mt-1">
                            {profile.currentLocation.longitude}
                          </p>
                        </div>
                      )}
                      {profile.currentLocation.address && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-gray-600 uppercase">
                            Address
                          </label>
                          <p className="text-sm mt-1">
                            {profile.currentLocation.address}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {profile.currentLocation}
                    </p>
                  )}
                </div>
              )}

              {/* Account Info */}
              {(profile.joinedAt || profile.updatedAt) && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold mb-4">Account Information</h2>

                  <div className="space-y-3 text-sm text-gray-600">
                    {profile.joinedAt && (
                      <p>
                        <span className="font-semibold">Joined:</span>{" "}
                        {new Date(profile.joinedAt).toLocaleDateString()}
                      </p>
                    )}
                    {profile.updatedAt && (
                      <p>
                        <span className="font-semibold">Last Updated:</span>{" "}
                        {new Date(profile.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !profile && (
            <div className="text-center py-12 bg-white rounded-lg">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 font-medium">
                Profile information not available
              </p>
              <p className="text-sm text-gray-500">
                Please check your connection and try again
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}