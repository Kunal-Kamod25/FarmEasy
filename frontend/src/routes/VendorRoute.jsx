import { Navigate } from "react-router-dom";

const VendorRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "vendor") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default VendorRoute;
