
import { useEffect, useState } from "react";
import api from "../../services/api";

const initialForm = {
  name: "",
  amount: "",
  returnPercentage: "",
  withdrawalType: "MONTHLY",
};

function InvestmentPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  // Fetch investment plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/investment-packages", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      // Supports common response shapes.
      const result = response.data.data;

      const fetchedPlans = Array.isArray(result)
        ? result
        : result?.packages || result?.plans || result?.investmentPackages || [];

      setPlans(fetchedPlans);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch investment plans"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(initialForm);
    setError("");
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (plan) => {
    setEditingPlan(plan);

    setFormData({
      name: plan.name || "",
      amount: plan.amount ?? "",
      returnPercentage: plan.returnPercentage ?? "",
      withdrawalType: plan.withdrawalType || "MONTHLY",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    setFormData(initialForm);
    setError("");
  };

  // Create or update plan
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        amount: Number(formData.amount),
        returnPercentage: Number(formData.returnPercentage),
        withdrawalType: formData.withdrawalType,
      };

      if (
        !payload.name ||
        payload.amount <= 0 ||
        payload.returnPercentage <= 0
      ) {
        setError("Please enter valid plan details.");
        return;
      }

      if (editingPlan) {
        await api.put(
          `/investment-packages/${editingPlan.id}`,
          payload
        );

        setSuccess("Investment plan updated successfully.");
      } else {
        await api.post("/investment-packages", payload);

        setSuccess("Investment plan created successfully.");
      }

      closeModal();
      await fetchPlans();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save investment plan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Activate / deactivate plan
  const handleStatusChange = async (plan) => {
    const nextStatus =
      plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus.toLowerCase()} ${plan.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      // Assumes PATCH /:id/status accepts { status }.
      await api.patch(
        `/investment-packages/${plan.id}/status`,
        { status: nextStatus }
      );

      setSuccess(`Plan ${nextStatus.toLowerCase()} successfully.`);
      await fetchPlans();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update plan status"
      );
    }
  };

  // Delete plan
  const handleDelete = async (plan) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${plan.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/investment-packages/${plan.id}`);

      setSuccess("Investment plan deleted successfully.");
      await fetchPlans();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete investment plan"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Investment Plans
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage investment packages.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          + Create Plan
        </button>
      </div>

      {/* Messages */}
      {error && !modalOpen && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Plans table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading investment plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No investment plans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Plan Name</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Return</th>
                  <th className="px-5 py-4">Withdrawal</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {plan.name}
                    </td>

                    <td className="px-5 py-4">
                      ₹{Number(plan.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      {plan.returnPercentage}%
                    </td>

                    <td className="px-5 py-4">
                      {plan.withdrawalType}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          plan.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleStatusChange(plan)}
                          className="font-medium text-orange-600 hover:text-orange-800"
                        >
                          {plan.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(plan)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlan ? "Edit Investment Plan" : "Create Investment Plan"}
              </h2>

              <button
                onClick={closeModal}
                className="text-2xl text-gray-400 hover:text-gray-700"
                disabled={submitting}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && modalOpen && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Plan Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Monthly Growth"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Investment Amount (₹)
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Return Percentage (%)
                </label>

                <input
                  type="number"
                  name="returnPercentage"
                  value={formData.returnPercentage}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Withdrawal Type
                </label>

                <select
                  name="withdrawalType"
                  value={formData.withdrawalType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingPlan
                    ? "Update Plan"
                    : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentPlansPage;
