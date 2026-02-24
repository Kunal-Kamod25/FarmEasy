import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Percent,
} from "lucide-react";

export default function VendorDashboard() {
  const [vendorStats, setVendorStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOffers: 0,
  });

  const token = localStorage.getItem("token");

  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vendor/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVendorStats(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  // ================= DONUT CHART DATA =================
  const pieData = [
    { name: "Products", value: vendorStats.totalProducts },
    { name: "Orders", value: vendorStats.totalOrders },
    { name: "Offers", value: vendorStats.activeOffers },
  ];

  const COLORS = ["#16A34A", "#EAB308", "#6366F1"];

  return (
    <div
      className="min-h-screen p-6 space-y-6 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-yellow-700/60 backdrop-blur-sm"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 space-y-6">

        {/* ===== HEADER ===== */}
        <h1 className="text-3xl font-bold text-white">
          Vendor Dashboard 🌾
        </h1>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={vendorStats.totalProducts}
            icon={<Package />}
          />
          <StatCard
            title="Total Orders"
            value={vendorStats.totalOrders}
            icon={<ShoppingCart />}
          />
          <StatCard
            title="Total Revenue"
            value={`₹ ${vendorStats.totalRevenue}`}
            icon={<IndianRupee />}
          />
          <StatCard
            title="Active Offers"
            value={vendorStats.activeOffers}
            icon={<Percent />}
          />
        </div>

        {/* ===== ANALYTICS SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Donut Chart */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-green-200">
            <h2 className="font-semibold mb-4 text-gray-700">
              Business Overview
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-green-200 lg:col-span-2">
            <h2 className="font-semibold mb-6 text-gray-700">
              Performance Breakdown
            </h2>

            <ProgressBar
              label="Orders Completion"
              value={vendorStats.totalOrders}
              max={100}
            />
            <ProgressBar
              label="Product Growth"
              value={vendorStats.totalProducts}
              max={100}
            />
            <ProgressBar
              label="Active Offers"
              value={vendorStats.activeOffers}
              max={100}
            />
          </div>

        </div>

        {/* ===== MINI CARDS SECTION ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <MiniCard
            title="Average Monthly Revenue"
            value={`₹ ${Math.floor(vendorStats.totalRevenue / 12 || 0)}`}
          />

          <MiniCard
            title="Monthly Orders"
            value={Math.floor(vendorStats.totalOrders / 12 || 0)}
          />

          <MiniCard
            title="Estimated Growth"
            value="+12%"
          />

        </div>

      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl p-6 shadow-lg flex items-center justify-between
    bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400
    text-white hover:scale-105 transition duration-300">

      <div>
        <p className="text-sm opacity-90">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>

      <div className="opacity-90">
        {icon}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-1 text-gray-600">
        <span>{label}</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 h-3 rounded-full">
        <div
          className="bg-gradient-to-r from-green-500 to-lime-400 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="rounded-2xl p-6 shadow-xl
    bg-gradient-to-br from-yellow-100 via-green-100 to-emerald-200
    border border-green-300">

      <p className="text-sm text-green-800">{title}</p>
      <h3 className="text-xl font-bold text-green-900 mt-2">{value}</h3>
    </div>
  );
}