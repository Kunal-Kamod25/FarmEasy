import { Navigate } from "react-router-dom";

const VendorRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const normalizedRole = String(user?.role || "").toLowerCase();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!["vendor", "seller"].includes(normalizedRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default VendorRoute;
