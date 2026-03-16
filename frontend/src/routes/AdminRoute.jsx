import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const normalizedRole = String(user?.role || "").toLowerCase();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (normalizedRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
