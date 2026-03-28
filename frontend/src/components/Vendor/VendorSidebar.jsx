import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    User,
    LogOut,
    Menu,
    X,
    ShoppingBag,
} from "lucide-react";

const VendorSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <>
            {/* Mobile hamburger - only shows on small screens */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-20 left-4 z-50 bg-[#0f3d2e] text-white p-2.5 rounded-xl shadow-lg border border-white/10"
            >
                <Menu size={20} />
            </button>

            {/* Dark overlay when mobile menu is open */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
                />
            )}

            {/* ── THE SIDEBAR ── */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-50 md:relative md:z-auto
                    flex flex-col bg-[#0f3d2e] text-white
                    transition-all duration-500 ease-in-out
                    ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-20 hover:w-64"}
                    h-full shadow-2xl overflow-hidden
                `}
            >
                {/* Mobile close button */}
                <div className="flex justify-end p-6 md:hidden">
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Nav links - scrollable area */}
                <nav className="mt-4 space-y-2 px-3 flex-grow overflow-y-auto no-scrollbar">
                    
                    <SidebarLink to="/vendor" icon={<LayoutDashboard size={22} />} label="Dashboard" />
                    <SidebarLink to="/vendor/products" icon={<Package size={22} />} label="My Products" />
                    <SidebarLink to="/vendor/orders" icon={<ShoppingCart size={22} />} label="Orders" />
                    <SidebarLink to="/vendor/sales" icon={<BarChart3 size={22} />} label="Sales" />
                    <SidebarLink to="/vendor/profile" icon={<User size={22} />} label="Profile" />

                    <div className="border-t border-white/5 my-4 mx-4" />

                    <SidebarLink
                        to="/"
                        icon={<ShoppingBag size={22} />}
                        label="Go to Shop"
                        external
                    />
                </nav>

                {/* Logout button sticky at bottom */}
                <div className="p-3 border-t border-white/5 mt-auto flex-shrink-0 bg-[#0f3d2e]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all text-white/50 hover:text-red-400 font-bold group/btn overflow-hidden"
                    >
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <LogOut size={20} />
                        </div>
                        <span className="opacity-500 group-hover:md:opacity-500 transition-opacity duration-900 whitespace-nowrap text-sm tracking-wide">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

const SidebarLink = ({ to, icon, label, external }) => {
    return (
        <NavLink
            to={to}
            end={to === "/vendor"}
            className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-2xl transition-all relative overflow-hidden group
         ${isActive && !external
                    ? "bg-white/10 text-white shadow-inner before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-emerald-400 before:rounded-r-full"
                    : external
                        ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                }`
            }
        >
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <span className="opacity-500 group-hover:md:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-black uppercase tracking-widest leading-none">
                {label}
            </span>
        </NavLink>
    );
};

export default VendorSidebar;
