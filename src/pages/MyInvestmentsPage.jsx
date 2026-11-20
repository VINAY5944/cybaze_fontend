
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyInvestment = {
  packageId: "",
  amount: "",
  investmentDate: "",
};

function MyInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [plans, setPlans] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [formInvestments, setFormInvestments] = useState([
    { ...emptyInvestment },
  ]);

  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch active investment plans.
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);

      const response = await api.get("/investment-packages", {
        params: { page: 1, limit: 100 },
      });

      const result = response.data.data;

      const fetchedPlans = Array.isArray(result)
        ? result
        : result?.packages ||
          result?.plans ||
          result?.investmentPackages ||
          [];

      // Customers should only see active plans.
      setPlans(fetchedPlans.filter((plan) => plan.status === "ACTIVE"));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load investment plans."
      );
    } finally {
      setPlansLoading(false);
    }
  };

  // Fetch only the logged-in customer's investments.
  const fetchInvestments = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/investments/mine", {
        params: {
          page,
          limit: 10,
        },
      });

      const result = response.data.data;

      setInvestments(result.investments || []);
      setPagination(
        result.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your investments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchInvestments(1);
  }, []);

  // Update an investment row in the form.
  const handleInvestmentChange = (index, field, value) => {
    setFormInvestments((prev) =>
      prev.map((investment, i) =>
        i === index
          ? { ...investment, [field]: value }
          : investment
      )
    );
  };

  // Add another investment row.
  const addInvestmentRow = () => {
    if (formInvestments.length >= 20) {
      setError("You can create a maximum of 20 investments at once.");
      return;
    }

    setError("");
    setFormInvestments((prev) => [
      ...prev,
      { ...emptyInvestment },
    ]);
  };

  // Remove an investment row.
  const removeInvestmentRow = (index) => {
    setFormInvestments((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Create investments.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formInvestments.length === 0) {
      setError("Add at least one investment.");
      return;
    }

    for (const investment of formInvestments) {
      if (!investment.packageId) {
        setError("Please select an investment plan for every entry.");
        return;
      }

      if (!investment.amount || Number(investment.amount) <= 0) {
        setError("Please enter a valid investment amount.");
        return;
      }
    }

    const payload = {
      investments: formInvestments.map((investment) => ({
        packageId: investment.packageId,
        amount: Number(investment.amount),
        ...(investment.investmentDate
          ? { investmentDate: investment.investmentDate }
          : {}),
      })),
    };

    try {
      setSubmitting(true);

      const response = await api.post("/investments", payload);

      const result = response.data.data;

      setSuccess(
        response.data.message || "Investments created successfully."
      );

      setFormInvestments([{ ...emptyInvestment }]);
      setShowForm(false);

      await fetchInvestments(1);

      if (result?.totalInvestments) {
        setSuccess(
          `${result.totalInvestments} investment(s) created successfully. Total amount: ₹${formatAmount(result.totalAmount)}`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create investments."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return "-";

    // Date-only strings should not be shifted by timezone conversion.
    const dateOnly = String(date).slice(0, 10);
    const [year, month, day] = dateOnly.split("-");

    if (!year || !month || !day) return date;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Investments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your investment portfolio.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm((prev) => !prev);
          }}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Close Form" : "+ Create Investment"}
        </button>
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

      {/* Create investment form */}
      {showForm && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Create Investments
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select an active plan and enter the amount for each investment.
              You can add up to 20 entries.
            </p>
          </div>

          {plansLoading ? (
            <p className="text-sm text-gray-500">
              Loading available plans...
            </p>
          ) : plans.length === 0 ? (
            <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              No active investment plans are currently available.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {formInvestments.map((investment, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      Investment {index + 1}
                    </h3>

                    {formInvestments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInvestmentRow(index)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Plan */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Investment Plan
                      </label>

                      <select
                        value={investment.packageId}
                        onChange={(e) =>
                          handleInvestmentChange(
                            index,
                            "packageId",
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="">Select a plan</option>

                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - ₹{formatAmount(plan.amount)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Investment Amount (₹)
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={investment.amount}
                        onChange={(e) =>
                          handleInvestmentChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        placeholder="Enter amount"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>

                    {/* Investment date */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Investment Date
                      </label>

                      <input
                        type="date"
                        value={investment.investmentDate}
                        onChange={(e) =>
                          handleInvestmentChange(
                            index,
                            "investmentDate",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty to use today.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={addInvestmentRow}
                  disabled={formInvestments.length >= 20}
                  className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                >
                  + Add Another Investment
                </button>

                <button
                  type="submit"
                  disabled={submitting || plans.length === 0}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Submit Investments"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Investment history */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Investment History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Total investments: {pagination.total}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading your investments...
          </div>
        ) : investments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">
              You haven't made any investments yet.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Choose an available plan to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Investment Amount</th>
                  <th className="px-5 py-4">Return</th>
                  <th className="px-5 py-4">Withdrawal</th>
                  <th className="px-5 py-4">Investment Date</th>
                  <th className="px-5 py-4">Next Profit Date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {investments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {investment.package?.name || "Investment Plan"}
                      </div>
                      <div className="mt-1 font-mono text-xs text-gray-400">
                        {investment.id.slice(0, 8)}...
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      ₹{formatAmount(investment.investmentAmount)}
                    </td>

                    <td className="px-5 py-4">
                      {investment.returnPercentage}%
                    </td>

                    <td className="px-5 py-4">
                      {investment.withdrawalType}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(investment.investmentDate)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(investment.nextProfitDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          investment.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : investment.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {investment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => fetchInvestments(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={() => fetchInvestments(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
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

export default MyInvestmentsPage;
