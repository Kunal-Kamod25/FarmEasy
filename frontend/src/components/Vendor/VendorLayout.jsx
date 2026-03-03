import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

const VendorLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <VendorSidebar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default VendorLayout;