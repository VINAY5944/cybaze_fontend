
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

function CustomerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  // Logout customer
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  // Common navigation link styles
  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 md:flex">

      {/* Sidebar */}
      <aside className="flex w-full flex-col bg-white shadow-sm md:min-h-screen md:w-64">

        {/* Logo */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-blue-600">
            InvestPro
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Investment Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <span>⌂</span>
            Dashboard
          </NavLink>

          <NavLink to="/my-investments" className={getNavLinkClass}>
            <span>▣</span>
            My Investments
          </NavLink>
          <NavLink to="/my-profits" className={getNavLinkClass}>
            <span>💰</span>
            My Profits
          </NavLink>
        </nav>

        {/* Customer profile */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "Customer"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Customer Portal
            </h2>
            <p className="text-sm text-slate-500">
              Manage your investments and profits
            </p>
          </div>

          <div className="hidden text-sm text-slate-600 sm:block">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </div>
        </header>

        {/* Nested pages render here */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default CustomerLayout;
