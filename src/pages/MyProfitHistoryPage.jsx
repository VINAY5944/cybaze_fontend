
import { useEffect, useState } from "react";
import api from "../services/api";

function MyProfitHistoryPage() {
  const [profits, setProfits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [withdrawalPagination, setWithdrawalPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [balance, setBalance] = useState({
    availableBalance: 0,
    totalWithdrawn: 0,
    walletBalance: 0,
  });

  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Format currency
  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  // Format dates without shifting date-only values
  const formatDate = (date) => {
    if (!date) return "-";

    const value = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T00:00:00`)
      : new Date(date);

    if (Number.isNaN(value.getTime())) return "-";

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch customer's profit history
  const fetchProfits = async (page = 1, selectedStatus = status) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/profits/mine", {
        params: {
          page,
          limit: 10,
          ...(selectedStatus ? { status: selectedStatus } : {}),
        },
      });

      const data = response.data.data;

      setProfits(data.profits || []);

      setPagination({
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch profit history"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet and profit balances
  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);

      const response = await api.get("/profits/mine/balance");
      const data = response.data.data;

      setBalance({
        availableBalance: Number(data.availableBalance || 0),
        totalWithdrawn: Number(data.totalWithdrawn || 0),
        walletBalance: Number(data.walletBalance || 0),
      });
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch wallet withdrawal history
  const fetchWithdrawals = async (page = 1) => {
    try {
      const response = await api.get("/profits/mine/withdrawals", {
        params: {
          page,
          limit: 10,
        },
      });

      const data = response.data.data;

      setWithdrawals(
        data.withdrawals ||
        data.transactions ||
        data.walletTransactions ||
        []
      );

      setWithdrawalPagination({
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0,
      });
    } catch (err) {
      console.error("Failed to fetch wallet history:", err);
    }
  };

  // Initial page loading
  useEffect(() => {
    fetchProfits(1, status);
  }, [status]);

  useEffect(() => {
    fetchBalance();
    fetchWithdrawals(1);
  }, []);

  // Transfer available profit into internal wallet
  const handleWithdraw = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const withdrawAmount = Number(amount);

    if (!amount || !Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      setError("Amount can have a maximum of two decimal places.");
      return;
    }

    if (withdrawAmount > balance.availableBalance) {
      setError("Amount exceeds your available profit.");
      return;
    }

    try {
      setWithdrawing(true);

      const response = await api.post("/profits/mine/withdraw", {
        amount: withdrawAmount,
      });

      setSuccess(
        response.data.message || "Profit successfully transferred to wallet."
      );

      setAmount("");

      // Refresh all affected information
      await Promise.all([
        fetchBalance(),
        fetchProfits(1, status),
        fetchWithdrawals(1),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Profit transfer failed."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  // Read allocations using common association names
  const getAllocations = (transaction) => {
    return (
      transaction.allocations ||
      transaction.profitAllocations ||
      transaction.profitWithdrawalAllocations ||
      []
    );
  };

  return (
    <div className="space-y-8">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Profit & Wallet
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your available profits and internal wallet transfers.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Available Profit
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {formatAmount(balance.availableBalance)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Withdrawn
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {formatAmount(balance.totalWithdrawn)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Internal Wallet Balance
          </p>

          <h2 className="mt-2 text-2xl font-bold text-purple-600">
            {formatAmount(balance.walletBalance)}
          </h2>
        </div>

      </div>

      {balanceLoading && (
        <p className="text-sm text-slate-500">
          Refreshing balances...
        </p>
      )}

      {/* Transfer profit to wallet */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Transfer Profit to Wallet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Transfer part or all of your available profit into your internal wallet.
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="max-w-xl space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Available Profit
            </label>

            <p className="text-lg font-semibold text-green-600">
              {formatAmount(balance.availableBalance)}
            </p>
          </div>

          <div>
            <label
              htmlFor="withdrawAmount"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Amount to Transfer
            </label>

            <input
              id="withdrawAmount"
              type="number"
              min="0.01"
              max={balance.availableBalance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={withdrawing || balance.availableBalance <= 0}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              disabled={withdrawing || balance.availableBalance <= 0}
              onClick={() =>
                setAmount(balance.availableBalance.toFixed(2))
              }
              className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40"
            >
              Transfer Full Amount
            </button>

            <button
              type="submit"
              disabled={
                withdrawing ||
                balance.availableBalance <= 0 ||
                !amount
              }
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {withdrawing ? "Transferring..." : "Transfer to Wallet"}
            </button>

          </div>

          <p className="text-xs text-slate-500">
            This transfers profit to your internal wallet. It does not send
            money to a bank account.
          </p>
        </form>
      </div>

      {/* Success and error messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Profit history */}
      <div className="space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Profit History
            </h2>

            <p className="text-sm text-slate-500">
              {pagination.total} total profit records
            </p>
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Profits</option>
            <option value="AVAILABLE">Available</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Investment</th>
                  <th className="px-5 py-4">Period</th>
                  <th className="px-5 py-4">Generated Profit</th>
                  <th className="px-5 py-4">Withdrawn</th>
                  <th className="px-5 py-4">Available</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                      Loading profit history...
                    </td>
                  </tr>
                ) : profits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                      No profit records found.
                    </td>
                  </tr>
                ) : (
                  profits.map((profit) => (
                    <tr key={profit.id} className="hover:bg-slate-50">

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {formatAmount(profit.investment?.investmentAmount)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {profit.investment?.withdrawalType || "-"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(profit.periodStart)}
                        <span className="mx-1">to</span>
                        {formatDate(profit.periodEnd)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {formatAmount(profit.amount)}
                      </td>

                      <td className="px-5 py-4 text-blue-600">
                        {formatAmount(profit.withdrawnAmount)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-green-600">
                        {formatAmount(profit.availableAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            profit.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {profit.status}
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* Profit pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">

            <p className="text-sm text-slate-500">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </p>

            <div className="flex gap-3">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchProfits(pagination.page - 1)}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  pagination.page >= pagination.totalPages || loading
                }
                onClick={() => fetchProfits(pagination.page + 1)}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet transaction history */}
      <div className="space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Wallet Transfer History
          </h2>

          <p className="text-sm text-slate-500">
            History of profits transferred into your internal wallet.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Transaction</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Profit Entries</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-slate-500">
                      No wallet transfers found.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((transaction) => {
                    const allocations = getAllocations(transaction);

                    return (
                      <tr key={transaction.id} className="hover:bg-slate-50">

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            Profit transfer
                          </p>

                          <p className="text-xs text-slate-500">
                            {transaction.id}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-green-600">
                          {formatAmount(transaction.amount)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(
                            transaction.createdAt ||
                            transaction.transactionDate ||
                            transaction.created_at
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {allocations.length > 0 ? (
                            <div className="space-y-1">
                              <p>{allocations.length} profit entries</p>

                              {allocations.map((allocation, index) => (
                                <p key={allocation.id || index} className="text-xs text-slate-500">
                                  {formatAmount(
                                    allocation.amount ||
                                    allocation.withdrawnAmount
                                  )}
                                  {allocation.profit?.periodStart
                                    ? ` - ${formatDate(allocation.profit.periodStart)}`
                                    : ""}
                                </p>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>

          {/* Wallet history pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">

            <p className="text-sm text-slate-500">
              Page {withdrawalPagination.page} of{" "}
              {Math.max(withdrawalPagination.totalPages, 1)}
            </p>

            <div className="flex gap-3">
              <button
                disabled={withdrawalPagination.page <= 1}
                onClick={() =>
                  fetchWithdrawals(withdrawalPagination.page - 1)
                }
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  withdrawalPagination.page >=
                  withdrawalPagination.totalPages
                }
                onClick={() =>
                  fetchWithdrawals(withdrawalPagination.page + 1)
                }
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MyProfitHistoryPage;
