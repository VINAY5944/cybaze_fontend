
import { useEffect, useState } from "react";
import api from "../../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users", {
        params: {
          page,
          limit: pagination.limit,
        },
      });

      const result = response.data.data;

      setUsers(result.users || []);
      setPagination(
        result.pagination || {
          total: result.users?.length || 0,
          page,
          limit: pagination.limit,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Open create modal
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData(initialForm);
    setError("");
  };

  // Handle form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create or update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingUser) {
        // Update existing user
        await api.put(`/users/${editingUser.id}`, {
          name: formData.name,
          email: formData.email,
        });

        setSuccess("User updated successfully");
      } else {
        // Create new customer
        await api.post("/users", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setSuccess("User created successfully");
      }

      closeModal();
      await fetchUsers(pagination.page);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Activate / deactivate user
  const handleStatusChange = async (user) => {
    const newStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus.toLowerCase()} ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.patch(`/users/${user.id}/status`, {
        status: newStatus,
      });

      setSuccess(`User ${newStatus.toLowerCase()} successfully`);

      await fetchUsers(pagination.page);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update user status"
      );
    }
  };

  // Delete user (backend soft delete)
  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/users/${user.id}`);

      setSuccess("User deactivated successfully");

      await fetchUsers(pagination.page);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete user"
      );
    }
  };

  // Pagination
  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.page
    ) {
      return;
    }

    fetchUsers(newPage);
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            User Management
          </h1>

          <p className="text-slate-500 mt-1">
            Create and manage customer accounts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
        >
          + Create User
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mt-5 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && !modalOpen && (
        <div className="mt-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* User table */}
      <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">
            All Users
          </h2>

          <span className="text-sm text-slate-500">
            Total: {pagination.total}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleStatusChange(user)}
                          className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                        >
                          {user.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

 
<button
  onClick={() => handleDelete(user)}
  className="text-red-600 hover:text-red-800 text-sm font-medium"
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

        {/* Pagination */}
        <div className="p-5 border-t border-slate-200 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages || 1}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? "Edit User" : "Create User"}
              </h2>

              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Initial password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
