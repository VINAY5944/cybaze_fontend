
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">
          Investment Manager
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </nav>

      <main className="p-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name}!
        </h2>

        <p className="text-slate-500 mt-2">
          Your investment dashboard is ready.
        </p>

        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <p className="text-slate-500">Account role</p>
          <p className="text-lg font-semibold mt-1">
            {user?.role}
          </p>

          <p className="text-slate-500 mt-4">Email</p>
          <p className="font-semibold mt-1">{user?.email}</p>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
