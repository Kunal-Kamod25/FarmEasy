import { User, Package, Shield, ChevronRight, LogOut } from "lucide-react";

const ProfileSidebar = ({ activeTab, setActiveTab, navigate }) => {
    return (
        <aside className="w-full lg:w-1/4 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-3">
                <nav className="space-y-1">

                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "profile"
                            ? "bg-emerald-50 text-emerald-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <User size={20} />
                        <span>General Info</span>
                        {activeTab === "profile" && <ChevronRight size={16} className="ml-auto" />}
                    </button>

                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "orders"
                            ? "bg-emerald-50 text-emerald-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <Package size={20} />
                        <span>My Orders</span>
                        {activeTab === "orders" && <ChevronRight size={16} className="ml-auto" />}
                    </button>

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

                </nav>
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-3xl text-red-600 font-bold bg-white border border-red-100 hover:bg-red-50 transition-all duration-300 shadow-sm"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </aside>
    );
};

export default ProfileSidebar;