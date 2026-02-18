import React, { useState } from "react";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Percent,
  Star,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// Dummy Stats
const vendorStats = {
  totalProducts: 3,
  totalOrders: 132,
  totalRevenue: 58420,
  activeOffers: 2,
};

// Graph Data
const revenueData = [
  { name: "Mon", revenue: 1200, orders: 12 },
  { name: "Tue", revenue: 2100, orders: 18 },
  { name: "Wed", revenue: 1800, orders: 15 },
  { name: "Thu", revenue: 2600, orders: 22 },
  { name: "Fri", revenue: 3200, orders: 28 },
  { name: "Sat", revenue: 2800, orders: 20 },
  { name: "Sun", revenue: 3500, orders: 30 },
];

// Products Table Data
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
    <div className="space-y-6 p-6">

      {/* Header */}
      <h1 className="text-2xl lg:text-3xl font-bold">Vendor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={vendorStats.totalProducts} icon={<Package />} />
        <StatCard title="Total Orders" value={vendorStats.totalOrders} icon={<ShoppingCart />} />
        <StatCard title="Total Revenue" value={`₹ ${vendorStats.totalRevenue}`} icon={<IndianRupee />} />
        <StatCard title="Active Offers" value={vendorStats.activeOffers} icon={<Percent />} />
      </div>

      {/* Graph Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Revenue & Orders (Weekly)</h2>
        <div className="h-72">
          <div className="h-72 flex items-center justify-center text-gray-400">
            Weekly revenue chart coming soon 📊
          </div>

        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Manage Products</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Stock</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">₹ {p.price}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${p.stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                      {p.stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-2 flex gap-3">
                    <button
                      onClick={() => toggleStock(p.id)}
                      className="text-blue-600 hover:scale-110 transition"
                      title="Toggle Stock"
                    >
                      {p.stock ? <ToggleRight /> : <ToggleLeft />}
                    </button>
                    <button className="text-yellow-600 hover:scale-110 transition" title="Edit">
                      <Edit />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-red-600 hover:scale-110 transition"
                      title="Delete"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-400">
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

/* Small reusable stat card */
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="w-8 h-8 text-green-600">{icon}</div>
    </div>
  );
}
