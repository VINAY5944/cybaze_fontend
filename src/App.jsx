
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { fetchCurrentUser } from "./features/auth/authSlice";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MyInvestmentsPage from "./pages/MyInvestmentsPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import CustomerRoute from "./routes/CustomerRoute";
import AdminRoute from "./routes/AdminRoute";

import CustomerLayout from "./components/customer/CustomerLayout";
import AdminLayout from "./components/admin/AdminLayout";

import UsersPage from "./pages/admin/UsersPage";
import ProfitPage from "./pages/admin/ProfitPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InvestmentPlansPage from "./pages/admin/InvestmentPlansPage";
import MyProfitHistoryPage from "./pages/MyProfitHistoryPage";
import AdminWalletWithdrawalsPage from "./pages/admin/AdminWalletWithdrawalsPage";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>

        {/* Customer-only pages */}
        <Route element={<CustomerRoute />}>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-investments" element={<MyInvestmentsPage />} />
            <Route path="/my-profits" element={<MyProfitHistoryPage />} />
          </Route>
        </Route>

        {/* Admin-only pages */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
             <Route
    path="wallet-withdrawals"
    element={<AdminWalletWithdrawalsPage />}
  />
            <Route
              path="investment-plans"
              element={<InvestmentPlansPage />}
            />
            <Route path="profits" element={<ProfitPage />} />
          </Route>
        </Route>

      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
