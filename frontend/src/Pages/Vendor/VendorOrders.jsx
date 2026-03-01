import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye, ShoppingCart, Clock, CheckCircle, XCircle } from "lucide-react";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/vendor/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

  const filteredOrders = orders.filter((order) => {
    const matchSearch = order.id.toString().includes(search) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status) => {
    const map = {
      Delivered: "bg-emerald-50 text-emerald-700",
      Pending: "bg-amber-50 text-amber-700",
      Cancelled: "bg-red-50 text-red-600",
      Processing: "bg-blue-50 text-blue-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3">
            <ShoppingCart size={18} />
          </div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Orders</p>
          <h3 className="text-3xl font-bold mt-1">{totalOrders}</h3>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3">
            <Clock size={18} />
          </div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Pending</p>
          <h3 className="text-3xl font-bold mt-1">{pendingOrders}</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3">
            <CheckCircle size={18} />
          </div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Delivered</p>
          <h3 className="text-3xl font-bold mt-1">{deliveredOrders}</h3>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3">
            <XCircle size={18} />
          </div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Cancelled</p>
          <h3 className="text-3xl font-bold mt-1">{cancelledOrders}</h3>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Pending", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${statusFilter === status
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-2xl p-5 mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 text-xs font-bold">
                            {order.customer_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">{order.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filteredOrders.length} of {totalOrders} orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Search, Eye } from "lucide-react";

// const VendorOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [search, setSearch] = useState("");

//   const token = localStorage.getItem("token");

//   // ================= FETCH ORDERS =================
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/vendor/orders",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setOrders(res.data);
//     } catch (error) {
//       console.error("Orders fetch error:", error);
//     }
//   };

//   // ================= FILTERED ORDERS =================
//   const filteredOrders = orders.filter((order) =>
//     order.id.toString().includes(search)
//   );

//   // ================= STATS =================
//   const totalOrders = orders.length;
//   const pendingOrders = orders.filter(
//     (o) => o.status === "Pending"
//   ).length;
//   const deliveredOrders = orders.filter(
//     (o) => o.status === "Delivered"
//   ).length;

//   return (
//     <div
//       className="min-h-screen p-6 bg-cover bg-center relative"
//       style={{
//         backgroundImage:
//           "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
//       }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-yellow-700/60 backdrop-blur-sm"></div>

//       {/* Content Wrapper */}
//       <div className="relative z-10 space-y-6">

//         {/* Header */}
//         <div>
//           <h2 className="text-3xl font-bold text-white">
//             Orders 🌾
//           </h2>
//           <p className="text-green-100 text-sm">
//             Manage and track customer orders
//           </p>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

//           <StatCard title="Total Orders" value={totalOrders} color="from-green-600 to-lime-500" />
//           <StatCard title="Pending" value={pendingOrders} color="from-yellow-500 to-orange-500" />
//           <StatCard title="Delivered" value={deliveredOrders} color="from-emerald-600 to-green-400" />

//         </div>

//         {/* Orders Card */}
//         <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-green-200 p-6">

//           {/* Search Bar */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="relative w-72">
//               <Search
//                 size={18}
//                 className="absolute left-3 top-2.5 text-gray-400"
//               />
//               <input
//                 type="text"
//                 placeholder="Search by Order ID..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
//               />
//             </div>

//             <span className="text-sm text-gray-600">
//               Showing {filteredOrders.length} of {totalOrders} orders
//             </span>
//           </div>

//           {/* Orders Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-green-700 uppercase text-xs tracking-wider border-b">
//                   <th className="text-left py-3">Order ID</th>
//                   <th className="text-left py-3">Customer</th>
//                   <th className="text-left py-3">Amount</th>
//                   <th className="text-left py-3">Status</th>
//                   <th className="text-left py-3">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-200">
//                 {filteredOrders.map((order) => (
//                   <tr
//                     key={order.id}
//                     className="hover:bg-green-50 transition"
//                   >
//                     <td className="py-4 font-medium text-gray-800">
//                       #{order.id}
//                     </td>

//                     <td className="py-4 text-gray-600">
//                       {order.customer_name}
//                     </td>

//                     <td className="py-4 text-gray-700 font-semibold">
//                       ₹ {order.total_amount}
//                     </td>

//                     <td className="py-4">
//                       <span
//                         className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                           order.status === "Delivered"
//                             ? "bg-green-100 text-green-700"
//                             : order.status === "Pending"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-red-100 text-red-600"
//                         }`}
//                       >
//                         {order.status}
//                       </span>
//                     </td>

//                     <td className="py-4">
//                       <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
//                         <Eye size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}

//                 {filteredOrders.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="text-center py-8 text-gray-500"
//                     >
//                       No orders found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// };

// /* ===== Stat Card Component ===== */
// const StatCard = ({ title, value, color }) => {
//   return (
//     <div
//       className={`rounded-2xl p-6 shadow-xl text-white bg-gradient-to-r ${color} hover:scale-105 transition`}
//     >
//       <p className="text-sm font-semibold">{title}</p>
//       <h3 className="text-2xl font-bold mt-2">{value}</h3>
//     </div>
//   );
// };

// export default VendorOrders;