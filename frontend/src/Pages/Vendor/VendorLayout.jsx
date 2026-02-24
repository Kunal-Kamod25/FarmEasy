import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";

const VendorLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <VendorSidebar />
            <div className="flex-1 p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default VendorLayout;
