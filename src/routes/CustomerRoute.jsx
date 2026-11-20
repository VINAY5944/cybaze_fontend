
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { isCustomerRole } from "../features/auth/roles";

function CustomerRoute() {
  const { isAuthenticated, authChecked, user } = useSelector(
    (state) => state.auth
  );

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isCustomerRole(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default CustomerRoute;
