import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import VendorNavbar from "./VendorNavbar";

const VendorLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* 1. Navbar at the top spanning 100% width */}
            <VendorNavbar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* 2. Sidebar below the navbar, sticky in its own area */}
                <VendorSidebar />
                
                {/* 3. Main content area scrollable independently */}
                <main className="flex-1 overflow-auto bg-gray-50/50 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default VendorLayout;