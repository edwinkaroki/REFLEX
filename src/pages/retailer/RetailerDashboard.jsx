import React, { useState } from "react";
import Sidebar from "../../components/shared/Sidebar";

export default function RetailerDashboard({ role, setRole }) {
  // 1. Business Overview & Profile State
  const [profile, setProfile] = useState(() => {
    return JSON.parse(localStorage.getItem("reflex-retailer")) || null;
  });
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
  });

  // 2. Create Delivery Form State
  const [deliveryForm, setDeliveryForm] = useState({
    customer_name: "",
    address: "",
    details: "",
    cost: "1500",
  });

  // 3 & 5. Deliveries Data State (Initial Data)
  const [deliveries, setDeliveries] = useState([
    {
      id: "DL-1048",
      customer_name: "Maya Okafor",
      address: "18 Palm Avenue",
      details: "Electronics package",
      status: "pending",
      rider_id: null,
      rider_name: "Unassigned",
      rider_location: "N/A",
      cost: "2000",
    },
    {
      id: "DL-1047",
      customer_name: "Jon Bell",
      address: "42 Market Street",
      details: "Clothing item",
      status: "out_for_delivery",
      rider_id: "RD-201",
      rider_name: "Grace Mensah",
      rider_location: "Marina Expressway",
      cost: "1500",
    },
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState(deliveries[1]);
  const [activeTab, setActiveTab] = useState("all");

  // Handler for Profile Setup
  function handleProfileSubmit(e) {
    e.preventDefault();
    const newProfile = { ...profileForm, createdAt: new Date().toISOString() };
    localStorage.setItem("reflex-retailer", JSON.stringify(newProfile));
    setProfile(newProfile);
  }

  // Handler for Delivery Creation
  function handleCreateDelivery(e) {
    e.preventDefault();
    const newEntry = {
      id: `DL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: deliveryForm.customer_name,
      address: deliveryForm.address,
      details: deliveryForm.details,
      status: "pending",
      rider_id: null,
      rider_name: "Unassigned",
      rider_location: "N/A",
      cost: deliveryForm.cost || "1500",
    };
    setDeliveries([newEntry, ...deliveries]);
    setDeliveryForm({
      customer_name: "",
      address: "",
      details: "",
      cost: "1500",
    });
    alert("Delivery request submitted successfully!");
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar role={role} setRole={setRole} />

      <main className="flex-1 p-6 md:ml-64 space-y-8">
        {/* 1. BUSINESS OVERVIEW */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">1. Business Overview</h2>
          {!profile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
              <p className="text-sm text-slate-500">
                Set up your business profile to start submitting deliveries.
              </p>
              <div>
                <label className="block text-sm font-medium">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={profileForm.businessName}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      businessName: e.target.value,
                    })
                  }
                  placeholder="e.g. Palm Street Market"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={profileForm.contactName}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      contactName: e.target.value,
                    })
                  }
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="+234 800 000 0000"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded font-medium"
              >
                Save Profile
              </button>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-lg font-semibold">{profile.businessName}</p>
                <p className="text-sm text-slate-600">
                  Contact: {profile.contactName} | {profile.phone}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-slate-600">Active Deliveries</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {deliveries.filter((d) => d.status !== "delivered").length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-slate-600">Completed Deliveries</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deliveries.filter((d) => d.status === "delivered").length}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-slate-600">Total Delivery Costs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₦
                    {deliveries.reduce(
                      (acc, curr) => acc + Number(curr.cost),
                      0,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. CREATE DELIVERY */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">2. Create Delivery</h2>
          <form
            onSubmit={handleCreateDelivery}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium">Customer Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={deliveryForm.customer_name}
                onChange={(e) =>
                  setDeliveryForm({
                    ...deliveryForm,
                    customer_name: e.target.value,
                  })
                }
                placeholder="Maya Okafor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Delivery Address
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={deliveryForm.address}
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, address: e.target.value })
                }
                placeholder="18 Palm Avenue"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Delivery Details
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={deliveryForm.details}
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, details: e.target.value })
                }
                placeholder="Package weight, handling notes, or contents description..."
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 py-2 rounded font-medium hover:bg-slate-800"
              >
                Submit Delivery Request
              </button>
            </div>
          </form>
        </section>

        {/* 3. MY DELIVERIES & STATUS FILTER */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">3. My Deliveries</h2>

          <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
            {[
              "all",
              "pending",
              "assigned",
              "picked_up",
              "out_for_delivery",
              "delivered",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                  activeTab === tab
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Address</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries
                  .filter((d) => activeTab === "all" || d.status === activeTab)
                  .map((d) => (
                    <tr key={d.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-semibold">{d.id}</td>
                      <td className="p-2">{d.customer_name}</td>
                      <td className="p-2">{d.address}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100">
                          {d.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => setSelectedDelivery(d)}
                          className="text-orange-600 underline font-medium text-xs"
                        >
                          Track / View Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. DELIVERY TRACKING */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">4. Delivery Tracking</h2>
          {selectedDelivery ? (
            <div className="p-4 bg-slate-50 border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">{selectedDelivery.id}</p>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-800">
                  {selectedDelivery.status}
                </span>
              </div>
              <p className="text-sm">
                <strong>Assigned Rider:</strong> {selectedDelivery.rider_name} (
                {selectedDelivery.rider_id || "None"})
              </p>
              <p className="text-sm">
                <strong>Rider Location:</strong>{" "}
                {selectedDelivery.rider_location}
              </p>
              <div className="p-3 bg-white border rounded text-xs text-slate-500 font-mono">
                [Real-time WebSocket connection active... Tracking status
                updates for {selectedDelivery.id}]
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Select a delivery from "My Deliveries" above to view tracking
              details.
            </p>
          )}
        </section>

        {/* 5. DELIVERY HISTORY */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">5. Delivery History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Details</th>
                  <th className="p-2">Cost</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{d.id}</td>
                    <td className="p-2">{d.customer_name}</td>
                    <td className="p-2 text-slate-600">{d.details}</td>
                    <td className="p-2 font-semibold">₦{d.cost}</td>
                    <td className="p-2 text-xs">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
