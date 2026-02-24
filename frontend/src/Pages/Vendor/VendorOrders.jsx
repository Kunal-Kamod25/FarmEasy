import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye } from "lucide-react";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ================= FETCH ORDERS =================
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vendor/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(res.data);
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  };

  // ================= FILTERED ORDERS =================
  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(search)
  );

  // ================= STATS =================
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "Pending"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.status === "Delivered"
  ).length;

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-yellow-700/60 backdrop-blur-sm"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white">
            Orders 🌾
          </h2>
          <p className="text-green-100 text-sm">
            Manage and track customer orders
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <StatCard title="Total Orders" value={totalOrders} color="from-green-600 to-lime-500" />
          <StatCard title="Pending" value={pendingOrders} color="from-yellow-500 to-orange-500" />
          <StatCard title="Delivered" value={deliveredOrders} color="from-emerald-600 to-green-400" />

        </div>

        {/* Orders Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-green-200 p-6">

          {/* Search Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-72">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
              />
            </div>

            <span className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {totalOrders} orders
            </span>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-green-700 uppercase text-xs tracking-wider border-b">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Customer</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-green-50 transition"
                  >
                    <td className="py-4 font-medium text-gray-800">
                      #{order.id}
                    </td>

                    <td className="py-4 text-gray-600">
                      {order.customer_name}
                    </td>

                    <td className="py-4 text-gray-700 font-semibold">
                      ₹ {order.total_amount}
                    </td>

                    <td className="py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4">
                      <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};

/* ===== Stat Card Component ===== */
const StatCard = ({ title, value, color }) => {
  return (
    <div
      className={`rounded-2xl p-6 shadow-xl text-white bg-gradient-to-r ${color} hover:scale-105 transition`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
};

export default VendorOrders;