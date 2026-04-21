import { User, Shield, ChevronRight, LogOut } from "lucide-react";

const ProfileSidebar = ({ activeTab, setActiveTab, navigate }) => {
    return (
        <aside className="w-full lg:w-1/4 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-emerald-950/20 overflow-hidden p-3 backdrop-blur-xl">
                <nav className="space-y-1">

                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "profile"
                            ? "bg-emerald-300/15 text-emerald-100 font-bold border border-emerald-300/35"
                            : "text-white/70 hover:bg-white/10"
                            }`}
                    >
                        <User size={20} />
                        <span>General Info</span>
                        {activeTab === "profile" && <ChevronRight size={16} className="ml-auto" />}
                    </button>

                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === "security"
                            ? "bg-emerald-300/15 text-emerald-100 font-bold border border-emerald-300/35"
                            : "text-white/70 hover:bg-white/10"
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
                    localStorage.removeItem("token");
                    navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-3xl text-rose-200 font-bold bg-rose-500/10 border border-rose-300/25 hover:bg-rose-500/20 transition-all duration-300 shadow-sm"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </aside>
    );
};

export default ProfileSidebar;