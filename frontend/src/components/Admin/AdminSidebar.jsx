import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { NavLink } from "react-router-dom";
import { FaUser, FaBoxOpen, FaClipboardList, FaStore } from "react-icons/fa";

const AdminSidebar = () => {
    return (
        <div className="p-4">
            <div className="flex items-center flex-col gap-4">
                <div className="pl-1 flex items-left px-8 h-15">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="logo"
                            className="h-16 md:h-24 w-auto object-contain"
                        />
                    </Link>
                </div>
                <h2 className="text-xl font-medium mb-6 text-white text-center">Admin Dashboard</h2>

                <nav className="flex flex-col space-y-2">
                    <NavLink to="/admin/users"
                        className={({ isActive }) =>
                            isActive ? "bg-gray-800 text-white py-3 px-4 rounded flex items-center space-x-2"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                        }
                    >
                        <FaUser />
                        <span>Users</span>
                    </NavLink>
                    <NavLink to="/admin/products"
                        className={({ isActive }) =>
                            isActive ? "bg-gray-800 text-white py-3 px-4 rounded flex items-center space-x-2"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                        }
                    >
                        <FaBoxOpen />
                        <span>Products</span>
                    </NavLink>
                    <NavLink to="/admin/orders"
                        className={({ isActive }) =>
                            isActive ? "bg-gray-800 text-white py-3 px-4 rounded flex items-center space-x-2"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                        }
                    >
                        <FaClipboardList />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink to="/admin/shop"
                        className={({ isActive }) =>
                            isActive ? "bg-gray-800 text-white py-3 px-4 rounded flex items-center space-x-2"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                        }
                    >
                        <FaStore />
                        <span>Shop</span>
                    </NavLink>
                    <NavLink to="/admin/users"
                        className={({ isActive }) =>
                            isActive ? "bg-gray-800 text-white py-3 px-4 rounded flex items-center space-x-2"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                        }
                    >
                        <FaUser />
                        <span>Users</span>
                    </NavLink>
                </nav>
            </div>
        </div>
    );
};

export default AdminSidebar;