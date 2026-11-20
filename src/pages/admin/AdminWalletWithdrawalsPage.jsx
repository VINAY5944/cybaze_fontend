
import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminWalletWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [userId, setUserId] = useState("");
  const [appliedUserId, setAppliedUserId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWithdrawals = async (
    page = 1,
    selectedUserId = appliedUserId
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/profits/withdrawals", {
        params: {
          page,
          limit: 10,
          ...(selectedUserId ? { userId: selectedUserId } : {}),
        },
      });

      const data = response.data.data;

      setWithdrawals(data.withdrawals || []);

      setPagination({
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch wallet withdrawal history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(1, "");
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();

    setAppliedUserId(userId.trim());
    fetchWithdrawals(1, userId.trim());
  };

  const handleClearFilter = () => {
    setUserId("");
    setAppliedUserId("");
    fetchWithdrawals(1, "");
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Wallet Withdrawal History
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor profit transfers made by customers into their internal wallets.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">
          Total Transactions
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-800">
          {pagination.total}
        </h2>
      </div>

      {/* Customer filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <form
          onSubmit={handleFilter}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter customer UUID"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={handleClearFilter}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Clear
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Transactions */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            Customer Transactions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Transaction ID</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Balance After</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                    No wallet transactions found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {transaction.user?.name || "Unknown Customer"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {transaction.user?.email || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-40 truncate text-xs text-slate-500">
                        {transaction.id}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {transaction.transactionType}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-green-600">
                      {formatAmount(transaction.amount)}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {formatAmount(transaction.balanceAfter)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(
                        transaction.createdAt ||
                        transaction.transactionDate
                      )}
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Profit allocations */}
        {!loading && withdrawals.length > 0 && (
          <div className="border-t border-slate-200 p-5">
            <h3 className="mb-4 font-semibold text-slate-800">
              Profit Allocation Details
            </h3>

            <div className="space-y-4">
              {withdrawals.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-800">
                        {transaction.user?.name || "Unknown Customer"}
                      </p>

                      <p className="text-xs text-slate-500">
                        Transaction: {transaction.id}
                      </p>
                    </div>

                    <p className="font-semibold text-green-600">
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>

                  {transaction.profitAllocations?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Profit ID</th>
                            <th className="px-3 py-2">Investment ID</th>
                            <th className="px-3 py-2">Period</th>
                            <th className="px-3 py-2">Allocated Amount</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {transaction.profitAllocations.map((allocation) => (
                            <tr key={allocation.id || allocation.profitId}>
                              <td className="px-3 py-3">
                                {allocation.profitId}
                              </td>

                              <td className="px-3 py-3">
                                {allocation.profit?.investmentId || "-"}
                              </td>

                              <td className="whitespace-nowrap px-3 py-3">
                                {formatDate(allocation.profit?.periodStart)}
                                {" - "}
                                {formatDate(allocation.profit?.periodEnd)}
                              </td>

                              <td className="px-3 py-3 font-semibold text-slate-800">
                                {formatAmount(allocation.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No allocation details available.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">

          <p className="text-sm text-slate-500">
            {pagination.total} transactions · Page {pagination.page} of{" "}
            {Math.max(pagination.totalPages, 1)}
          </p>

          <div className="flex gap-3">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() =>
                fetchWithdrawals(pagination.page - 1)
              }
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              onClick={() =>
                fetchWithdrawals(pagination.page + 1)
              }
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminWalletWithdrawalsPage;
