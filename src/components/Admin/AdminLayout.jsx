
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  // Logout admin
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  // Common navigation link styling
  const navClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col">
        <h1 className="text-xl font-bold mb-8">
          Investment Manager
        </h1>

        <p className="text-xs uppercase text-slate-400 mb-3">
          Administration
        </p>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink to="/admin" end className={navClass}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={navClass}>
            User Management
          </NavLink>

          <NavLink to="/admin/investment-plans" className={navClass}>
            Investment Plans
          </NavLink>

          <NavLink to="/admin/profits" className={navClass}>
            Profit Management
          </NavLink>

          <NavLink to="/admin/wallet-withdrawals" className={navClass}>
            <span className="mr-2">₹</span>
            Wallet Withdrawals
          </NavLink>
        </nav>

        {/* Admin Profile and Logout */}
        <div className="mt-auto border-t border-slate-700 pt-5">
          <p className="text-sm font-semibold">
            {user?.name || "Admin"}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {user?.email}
          </p>

          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white shadow-sm px-8 py-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Admin Panel
          </h2>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
