
import { useEffect, useState } from "react";
import api from "../../services/api";

// Get today's date in the browser's local timezone.
const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function ProfitPage() {
  const [profits, setProfits] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    investmentId: "",
  });

  const [processDate, setProcessDate] = useState(getToday());

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generationResult, setGenerationResult] = useState(null);

  // Fetch profits with pagination and filters.
  const fetchProfits = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (filters.status) params.status = filters.status;
      if (filters.userId.trim()) params.userId = filters.userId.trim();
      if (filters.investmentId.trim()) {
        params.investmentId = filters.investmentId.trim();
      }

      const response = await api.get("/profits", { params });

      const result = response.data.data;

      setProfits(result.profits || []);
      setPagination({
        total: result.total ?? 0,
        page: result.page ?? page,
        limit: result.limit ?? 10,
        totalPages: result.totalPages ?? 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch profit records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfits(1);
  }, []);

  // Apply filters.
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    setGenerationResult(null);
    fetchProfits(1);
  };

  // Clear filters.
  const handleClearFilters = () => {
    setFilters({
      status: "",
      userId: "",
      investmentId: "",
    });

    setSuccess("");
    setGenerationResult(null);
  };

  // Fetch again after clearing filters.
  useEffect(() => {
    if (
      filters.status === "" &&
      filters.userId === "" &&
      filters.investmentId === ""
    ) {
      fetchProfits(1);
    }
  }, [filters]);

  // Generate profits for all investments due on or before the date.
  const handleGenerateProfits = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm(
      processDate
        ? `Generate all due profits up to ${processDate}?`
        : "Generate all profits due up to today?"
    );

    if (!confirmed) return;

    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      setGenerationResult(null);

      const payload = processDate ? { date: processDate } : {};

      const response = await api.post("/profits/generate", payload);

      const result = response.data.data;

      setGenerationResult(result);
      setSuccess(
        response.data.message || "Profit generation completed successfully."
      );

      // Refresh the list after generation.
      await fetchProfits(1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate profits."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Profit Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and monitor profits from customer investments.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Generate profits */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Generate Due Profits
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This processes all active investments with profit dates due on or
            before the selected date. Previously generated periods are skipped.
          </p>
        </div>

        <form
          onSubmit={handleGenerateProfits}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="processDate"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Process date
            </label>

            <input
              id="processDate"
              type="date"
              value={processDate}
              max={getToday()}
              onChange={(e) => setProcessDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Leave empty to use today's date.
            </p>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Profits"}
          </button>
        </form>

        {/* Generation result */}
        {generationResult && (
          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Generation Summary
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Process Date</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {generationResult.processDate || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Investments Checked</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {generationResult.investmentsChecked ?? 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Profits Generated</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {generationResult.profitsGenerated ?? 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Total Profit Generated</p>
                <p className="mt-1 font-semibold text-green-700">
                  ₹{formatAmount(generationResult.totalProfitAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Skipped Investments</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {generationResult.skippedInvestments ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Profit history */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Profit History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Total records: {pagination.total}
          </p>

          {/* Filters */}
          <form
            onSubmit={handleFilterSubmit}
            className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Profit Status
              </label>

              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                User ID
              </label>

              <input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Enter user UUID"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Investment ID
              </label>

              <input
                type="text"
                name="investmentId"
                value={filters.investmentId}
                onChange={handleFilterChange}
                placeholder="Enter investment UUID"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading profit records...
          </div>
        ) : profits.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No profit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Profit ID</th>
                  <th className="px-5 py-4">Investment</th>
                  <th className="px-5 py-4">Investment Amount</th>
                  <th className="px-5 py-4">Return</th>
                  <th className="px-5 py-4">Period</th>
                  <th className="px-5 py-4">Profit Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Generated At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {profits.map((profit) => (
                  <tr key={profit.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      {profit.id?.slice(0, 8)}...
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-gray-600">
                      {profit.investmentId?.slice(0, 8)}...
                    </td>

                    <td className="px-5 py-4">
                      ₹
                      {formatAmount(
                        profit.investment?.investmentAmount
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {profit.investment?.returnPercentage ?? "-"}%
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(profit.periodStart)}
                      <span className="mx-1 text-gray-400">to</span>
                      {formatDate(profit.periodEnd)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      ₹{formatAmount(profit.amount)}
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

                    <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(profit.generatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => fetchProfits(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={() => fetchProfits(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfitPage;
