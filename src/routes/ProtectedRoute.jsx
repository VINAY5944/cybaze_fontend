
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute() {
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);

  // Wait until authentication is verified.
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Checking your session...</p>
      </div>
    );
  }

  // Not logged in.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
