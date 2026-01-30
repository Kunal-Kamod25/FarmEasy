import { NavLink } from "react-router-dom";

const VendorSidebar = () => {
    return (
        <div className="w-64 bg-green-700 text-white p-5 min-h-screen">
            <h2 className="text-2xl font-bold mb-8 text-center">Vendor Panel</h2>

            <nav className="space-y-3">
                <NavLink to="/vendor" end className={linkStyle}>Dashboard</NavLink>
                <NavLink to="/vendor/products" className={linkStyle}>Products</NavLink>
                <NavLink to="/vendor/add-product" className={linkStyle}>Add Product</NavLink>
                <NavLink to="/vendor/orders" className={linkStyle}>Orders</NavLink>
                <NavLink to="/vendor/sales" className={linkStyle}>Sales</NavLink>
                <NavLink to="/vendor/profile" className={linkStyle}>Profile</NavLink>
            </nav>
        </div>
    );
};

const linkStyle = ({ isActive }) =>
    `block p-2 rounded ${isActive ? "bg-green-900" : "hover:bg-green-600"}`;

export default VendorSidebar;
