import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    ShoppingCart,
    BarChart3,
    User,
    Users,
    LogOut,
    Menu,
    X,
} from "lucide-react";

import CompanyLogo from "../../assets/logo.png";

const VendorSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-green-700 text-white p-2 rounded-lg shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Overlay (Mobile) */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <div
                className="group hidden md:flex md:flex-col 
                bg-[#0f3d2e] text-white 
                transition-all duration-300
                w-20 hover:w-64 min-h-screen shadow-xl">
                {/* Close Button (Mobile) */}
                <div className="flex justify-end p-4 md:hidden">
                    <button onClick={() => setIsOpen(false)}>
                        <X size={22} />
                    </button>
                </div>

                {/* Logo */}
                <div className="flex items-center justify-center h-28 border-b border-white/10 px-4">
                    <img
                        src={CompanyLogo}
                        alt="Logo"
                        className="h-25 w-25 object-contain"
                    />
                </div>

                {/* Navigation */}
                <nav className="mt-6 space-y-2 px-3">

                    <SidebarLink to="/vendor" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <SidebarLink to="/vendor/products" icon={<Package size={20} />} label="Products" />
                    <SidebarLink to="/vendor/add-product" icon={<PlusCircle size={20} />} label="Add Product" />
                    <SidebarLink to="/vendor/orders" icon={<ShoppingCart size={20} />} label="Orders" />
                    <SidebarLink to="/vendor/sales" icon={<BarChart3 size={20} />} label="Sales" />
                    <SidebarLink to="/vendor/profile" icon={<User size={20} />} label="Profile" />

                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 w-full p-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-32 p-3 rounded-lg hover:bg-red-600 transition"
                    >
                        <LogOut size={20} />
                        <span className="hidden md:group-hover:block">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

const SidebarLink = ({ to, icon, label }) => {
    return (
        <NavLink
            to={to}
            end={to === "/vendor"}
            className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition relative
                 ${isActive
                    ? "bg-white/10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-green-400"
                    : "hover:bg-white/10"}`
            }
        >
            {icon}
            <span className="hidden md:group-hover:block whitespace-nowrap">
                {label}
            </span>
        </NavLink>
    );
};

export default VendorSidebar;
