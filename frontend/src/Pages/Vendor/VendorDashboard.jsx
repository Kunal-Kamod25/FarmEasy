import React, { useState } from "react";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Percent,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// dashboard numbers (normally from API)
const vendorStats = {
  totalProducts: 3,
  totalOrders: 132,
  totalRevenue: 58420,
  activeOffers: 2,
};

// weekly revenue + orders
const revenueData = [
  { name: "Mon", revenue: 1200, orders: 12 },
  { name: "Tue", revenue: 2100, orders: 18 },
  { name: "Wed", revenue: 1800, orders: 15 },
  { name: "Thu", revenue: 2600, orders: 22 },
  { name: "Fri", revenue: 3200, orders: 28 },
  { name: "Sat", revenue: 2800, orders: 20 },
  { name: "Sun", revenue: 3500, orders: 30 },
];

// initial product list
const initialProducts = [
  { id: 1, name: "Organic Fertilizer", price: 1200, stock: true },
  { id: 2, name: "Hybrid Seeds Pack", price: 850, stock: true },
  { id: 3, name: "Pesticide Spray", price: 650, stock: false },
];

export default function VendorDashboard() {
  const [products, setProducts] = useState(initialProducts);

  const toggleStock = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: !p.stock } : p
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-black">
        Vendor Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-white font-bold">
        <StatCard
          title="Total Products"
          value={vendorStats.totalProducts}
          icon={<Package />}
          bg="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Orders"
          value={vendorStats.totalOrders}
          icon={<ShoppingCart />}
          bg="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹ ${vendorStats.totalRevenue}`}
          icon={<IndianRupee />}
          bg="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Active Offers"
          value={vendorStats.activeOffers}
          icon={<Percent />}
          bg="from-orange-500 to-red-500"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Revenue & Orders (Weekly)
        </h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Section */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Products
          </h2>
          <span className="text-sm text-gray-500">
            {products.length} Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 uppercase text-xs tracking-wider border-b">
                <th className="text-left py-3">Product</th>
                <th className="text-left py-3">Price</th>
                <th className="text-left py-3">Stock Status</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-200 transition duration-200"
                >
                  <td className="py-4 font-medium text-gray-800">
                    {p.name}
                  </td>

                  <td className="py-4 text-gray-600">
                    ₹ {p.price}
                  </td>

                  <td className="py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${p.stock
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                        }`}
                    >
                      {p.stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStock(p.id)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        {p.stock ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>

                      <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* reusable stat card */
function StatCard({ title, value, icon, bg }) {
  return (
    <div className={`bg-gradient-to-r ${bg} text-white rounded-xl p-6 shadow-lg hover:scale-105 transition transform duration-300 flex justify-between items-center`}>
      <div>
        <p className="text-sm opacity-80">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="w-8 h-8 text-white">
        {icon}
      </div>
    </div>
  );
}
