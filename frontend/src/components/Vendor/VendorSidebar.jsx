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

import logo from "../../assets/Logo.png";

const VendorSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // clear everything from storage on logout
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <>
            {/* mobile hamburger - only shows on small screens */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-[#0f3d2e] text-white p-2 rounded-lg shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* dark overlay when mobile menu is open */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                />
            )}

            {/* ── THE SIDEBAR ── */}
            <div
                className="group hidden md:flex md:flex-col 
        bg-[#0f3d2e] text-white 
        transition-all duration-300
        w-20 hover:w-64 min-h-screen shadow-xl relative"
            >
                {/* close button on mobile */}
                <div className="flex justify-end p-4 md:hidden">
                    <button onClick={() => setIsOpen(false)}>
                        <X size={22} />
                    </button>
                </div>

                {/* logo */}
                <div className="flex items-center justify-center h-28 border-b border-white/10 px-4">
                    <img
                        src={logo}
                        alt="FarmEasy"
                        className="h-25 w-25 object-contain"
                    />
                </div>

                {/* nav links */}
                <nav className="mt-6 space-y-1 px-3 flex-1">

                    {/* Dashboard - main overview */}
                    <SidebarLink to="/vendor" icon={<LayoutDashboard size={20} />} label="Dashboard" />

                    {/* My Products - manage their catalog */}
                    <SidebarLink to="/vendor/products" icon={<Package size={20} />} label="My Products" />

                    {/* Orders - orders coming in from buyers */}
                    <SidebarLink to="/vendor/orders" icon={<ShoppingCart size={20} />} label="Orders" />

                    {/* Sales analytics */}
                    <SidebarLink to="/vendor/sales" icon={<BarChart3 size={20} />} label="Sales" />

                    {/* Profile */}
                    <SidebarLink to="/vendor/profile" icon={<User size={20} />} label="Profile" />

                    {/* divider */}
                    <div className="border-t border-white/10 my-3" />

                    {/* Go to Shop - lets vendor browse/buy as a customer */}
                    {/* This is important! vendors can also buy from other vendors */}
                    <SidebarLink
                        to="/"
                        icon={<ShoppingBag size={20} />}
                        label="Go to Shop"
                        external
                    />

                </nav>

                {/* logout button at bottom */}
                <div className="p-3 border-t border-white/10 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-600/80 transition text-white/80 hover:text-white"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className="hidden md:group-hover:block whitespace-nowrap text-sm font-medium">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};


// reusable sidebar nav link component
// external prop means it's going outside the vendor panel (to user side)
const SidebarLink = ({ to, icon, label, external }) => {
    return (
        <NavLink
            to={to}
            end={to === "/vendor"}
            className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition relative overflow-hidden
         ${isActive && !external
                    ? "bg-white/15 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-emerald-400 before:rounded-r"
                    : external
                        ? "text-emerald-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
            }
        >
            <span className="flex-shrink-0">{icon}</span>
            <span className="hidden md:group-hover:block whitespace-nowrap text-sm font-medium">
                {label}
            </span>
        </NavLink>
    );
};

export default VendorSidebar;
