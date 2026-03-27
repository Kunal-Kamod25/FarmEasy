import React from "react";
import { User, Bell, Search } from "lucide-react";
import logo from "../../assets/Logo.png";

const VendorNavbar = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return {};
    }
  })();

  const fullName = user?.full_name || user?.fullname || "Vendor";
  const truncatedName = fullName.length > 15 ? fullName.substring(0, 15) + "..." : fullName;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm px-6 py-3 flex items-center justify-between">
      {/* ── LEFT: LOGO & BRANDING ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="FarmEasy"
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-xl font-black text-[#0f3d2e] tracking-tight hidden md:block">
            FarmEasy <span className="text-emerald-600 ml-1 text-sm font-bold uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">Vendor</span>
          </h1>
        </div>
      </div>

      {/* ── RIGHT: USER INFO & SEARCH ── */}
      <div className="flex items-center gap-4">
        {/* Search bar placeholder (optional) */}
        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="pl-12 pr-6 py-2.5 bg-gray-50/50 border border-gray-100 rounded-[1.2rem] text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 w-48 lg:w-72 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:animate-ping"></span>
          </button>
        </div>

        <div className="h-10 w-[1px] bg-gray-100 mx-1"></div>

        <div className="flex items-center gap-3 pl-3 py-1 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-800 leading-tight group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{truncatedName}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Store Owner</p>
          </div>
          <div className="w-11 h-11 p-0.5 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:border-emerald-500 transition-all overflow-hidden">
            <div className="w-full h-full bg-emerald-50 rounded-[0.9rem] flex items-center justify-center overflow-hidden">
              {user?.profile_pic ? (
                <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-emerald-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendorNavbar;
