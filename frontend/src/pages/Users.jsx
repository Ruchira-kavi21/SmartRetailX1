import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../services/userService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUsers();

      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);

      if (error.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setError(
          "You do not have permission to manage users."
        );
      } else {
        setError(
          error.message || "Failed to load users."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (user) => {
    const newRole =
      user.role === "ADMIN"
        ? "CUSTOMER"
        : "ADMIN";

    const confirmed = window.confirm(
      `Change ${user.name}'s role to ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`role-${user.id}`);
      setError("");

      const response = await updateUserRole(
        user.id,
        newRole
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? response.data
            : currentUser
        )
      );
    } catch (error) {
      console.error(
        "Failed to update user role:",
        error
      );

      setError(
        error.message ||
          "Failed to update user role."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${user.id}`);
      setError("");

      await deleteUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) =>
            currentUser.id !== user.id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete user:",
        error
      );

      setError(
        error.message ||
          "Failed to delete user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleClass = (role) => {
    if (role === "ADMIN") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">
          SmartRetailX
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          User Management
        </h1>

        <p className="mt-2 text-slate-500">
          Manage users and their access roles.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            Loading users...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        users.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No users found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no registered users.
            </p>
          </div>
        )}

      {/* Users Table */}
      {!loading &&
        !error &&
        users.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => {
                    const isCurrentUser =
                      currentUser?.id === user.id;

                    const roleLoading =
                      actionLoading ===
                      `role-${user.id}`;

                    const deleteLoading =
                      actionLoading ===
                      `delete-${user.id}`;

                    return (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* User */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              User #{user.id}
                            </p>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {isCurrentUser ? (
                            <span className="text-xs font-medium text-slate-400">
                              Current user
                            </span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRoleChange(
                                    user
                                  )
                                }
                                disabled={
                                  roleLoading ||
                                  deleteLoading
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {roleLoading
                                  ? "Updating..."
                                  : user.role ===
                                    "ADMIN"
                                  ? "Make Customer"
                                  : "Make Admin"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    user
                                  )
                                }
                                disabled={
                                  roleLoading ||
                                  deleteLoading
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deleteLoading
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default Users;