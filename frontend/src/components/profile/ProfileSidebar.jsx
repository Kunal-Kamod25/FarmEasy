<<<<<<< HEAD
// import { User, Package, Shield, ChevronRight, LogOut } from "lucide-react";
=======
import { User, Shield, ChevronRight, LogOut } from "lucide-react";
>>>>>>> 6b65c54bb876fe1b0a8a3c7c294c11b2184ef0eb

// const ProfileSidebar = ({ activeTab, setActiveTab, navigate }) => {
//     return (
//         <aside className="w-full lg:w-1/4 space-y-4">
//             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-3">
//                 <nav className="space-y-1">

//                     <button
//                         onClick={() => setActiveTab("profile")}
//                         className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "profile"
//                             ? "bg-emerald-50 text-emerald-700 font-bold"
//                             : "text-slate-600 hover:bg-slate-50"
//                             }`}
//                     >
//                         <User size={20} />
//                         <span>General Info</span>
//                         {activeTab === "profile" && <ChevronRight size={16} className="ml-auto" />}
//                     </button>

<<<<<<< HEAD
//                     <button
//                         onClick={() => setActiveTab("orders")}
//                         className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "orders"
//                             ? "bg-emerald-50 text-emerald-700 font-bold"
//                             : "text-slate-600 hover:bg-slate-50"
//                             }`}
//                     >
//                         <Package size={20} />
//                         <span>My Orders</span>
//                         {activeTab === "orders" && <ChevronRight size={16} className="ml-auto" />}
//                     </button>

//                     <button
//                         onClick={() => setActiveTab("security")}
//                         className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "security"
//                             ? "bg-emerald-50 text-emerald-700 font-bold"
//                             : "text-slate-600 hover:bg-slate-50"
//                             }`}
//                     >
//                         <Shield size={20} />
//                         <span>Security</span>
//                         {activeTab === "security" && <ChevronRight size={16} className="ml-auto" />}
//                     </button>
=======
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "security"
                            ? "bg-emerald-50 text-emerald-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <Shield size={20} />
                        <span>Security</span>
                        {activeTab === "security" && <ChevronRight size={16} className="ml-auto" />}
                    </button>
>>>>>>> 6b65c54bb876fe1b0a8a3c7c294c11b2184ef0eb

//                 </nav>
//             </div>

//             <button
//                 onClick={() => {
//                     localStorage.removeItem("user");
//                     navigate("/login");
//                 }}
//                 className="w-full flex items-center gap-3 px-6 py-4 rounded-3xl text-red-600 font-bold bg-white border border-red-100 hover:bg-red-50 transition-all duration-300 shadow-sm"
//             >
//                 <LogOut size={20} />
//                 <span>Sign Out</span>
//             </button>
//         </aside>
//     );
// };

// export default ProfileSidebar;
 
// ─────────────────────────────────────────────
//  ProfileSidebar.jsx  —  Enhanced + Fixed
//  📁 src/components/profile/ProfileSidebar.jsx
// ─────────────────────────────────────────────
import { User, Package, Shield, ChevronRight, LogOut, Leaf, Bell } from "lucide-react";

const NAV_ITEMS = [
  { key: "profile",       icon: User,    label: "General Info",          desc: "Personal details" },
  { key: "orders",        icon: Package, label: "My Orders",             desc: "Order history" },
  { key: "notifications", icon: Bell,    label: "Notifications",         desc: "Alert preferences" },
  { key: "security",      icon: Shield,  label: "Security",              desc: "Account safety" },
];

const ProfileSidebar = ({ activeTab, setActiveTab, navigate, user }) => {
  const initials = user?.fullname
    ? user.fullname.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside className="w-full lg:w-72 space-y-4 flex-shrink-0">

      {/* ── Avatar Card ── */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm">

        {/* Green banner */}
        <div className="h-16 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-400 relative flex-shrink-0 rounded-t-3xl">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />
          <Leaf size={48} className="absolute right-4 top-4 text-white opacity-20" />
        </div>

        {/* Avatar — properly positioned below banner */}
        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-400 flex items-center justify-center text-white font-black text-xl shadow-lg border-4 border-white flex-shrink-0"
              style={{ fontFamily: "'Lora', Georgia, serif", marginTop: "-32px" }}
            >
              {initials}
            </div>
          </div>
          <p className="font-black text-slate-800 text-base leading-tight"
            style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {user?.fullname || "Welcome!"}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium truncate"
            style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {user?.email || ""}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span style={{ fontFamily: "'Lora', Georgia, serif" }}>
              {user?.role === "vendor" ? "Vendor" : "Customer"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Nav Card ── */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-3">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-3 pt-2 pb-3"
          style={{ fontFamily: "'Lora', Georgia, serif" }}>
          Navigation
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ key, icon: Icon, label, desc }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === key
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                activeTab === key
                  ? "bg-white/20"
                  : "bg-emerald-50 group-hover:bg-emerald-100"
              }`}>
                <Icon size={15} className={activeTab === key ? "text-white" : "text-emerald-600"} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold leading-tight"
                  style={{ fontFamily: "'Lora', Georgia, serif" }}>
                  {label}
                </p>
                <p className={`text-[10px] leading-tight mt-0.5 ${
                  activeTab === key ? "text-emerald-100" : "text-slate-400"
                }`}
                  style={{ fontFamily: "'Lora', Georgia, serif" }}>
                  {desc}
                </p>
              </div>
              {activeTab === key && <ChevronRight size={14} className="text-white/70 flex-shrink-0" />}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Sign Out ── */}
      <button
        onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}
        className="w-full flex items-center gap-3 px-5 py-4 rounded-3xl text-red-500 font-bold bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all duration-300 shadow-sm group"
      >
        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-all flex-shrink-0">
          <LogOut size={15} className="text-red-500" />
        </div>
        <span style={{ fontFamily: "'Lora', Georgia, serif" }}>Sign Out</span>
      </button>

    </aside>
  );
};

export default ProfileSidebar;