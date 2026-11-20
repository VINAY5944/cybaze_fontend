
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { normalizeRole } from "../features/auth/roles";

function AdminRoute() {
  const { user, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth
  );

  if (!authChecked) {
    return <div className="p-8 text-center">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only ADMIN can access these pages
  if (normalizeRole(user?.role) !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;