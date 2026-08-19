import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrders,
  updateOrderStatus,
} from "../services/orderService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [actionError, setActionError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrders();

        setOrders(response.data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);

        if (error.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else if (error.status === 403) {
          setError(
            "You do not have permission to view these orders."
          );
        } else {
          setError(
            error.message || "Failed to load orders."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setActionError("");

      const response = await updateOrderStatus(
        orderId,
        status
      );

      const updatedOrder = response.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? updatedOrder
            : order
        )
      );
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      if (error.status === 401) {
        setActionError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setActionError(
          "Only administrators can update order status."
        );
      } else if (error.status === 404) {
        setActionError("Order not found.");
      } else {
        setActionError(
          error.message ||
            "Failed to update order status."
        );
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirm = (orderId) => {
    handleStatusUpdate(orderId, "CONFIRMED");
  };

  const handleCancel = (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    handleStatusUpdate(orderId, "CANCELLED");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Orders
        </h1>

        <p className="mt-2 text-slate-500">
          {isAdmin
            ? "View and manage all customer orders."
            : "View your orders and their current status."}
        </p>
      </div>

      {/* General Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action Error */}
      {actionError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            Loading orders...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {isAdmin
                ? "There are currently no orders."
                : "You don't have any orders yet."}
            </p>
          </div>
        )}

      {/* Orders Table */}
      {!loading &&
        !error &&
        orders.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order ID
                    </th>

                    {isAdmin && (
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        User ID
                      </th>
                    )}

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Order ID */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                        #{order.id}
                      </td>

                      {/* User ID - Admin only */}
                      {isAdmin && (
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          #{order.userId}
                        </td>
                      )}

                      {/* Product ID */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        #{order.productId}
                      </td>

                      {/* Quantity */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {order.quantity}
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        LKR{" "}
                        {Number(
                          order.totalAmount
                        ).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/orders/${order.id}`}
                            className="font-medium text-blue-600 transition hover:text-blue-700"
                          >
                            View Details
                          </Link>

                          {/* Admin Order Controls */}
                          {isAdmin &&
                            order.status ===
                              "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    updatingOrderId ===
                                    order.id
                                  }
                                  onClick={() =>
                                    handleConfirm(
                                      order.id
                                    )
                                  }
                                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingOrderId ===
                                  order.id
                                    ? "Updating..."
                                    : "Confirm"}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    updatingOrderId ===
                                    order.id
                                  }
                                  onClick={() =>
                                    handleCancel(
                                      order.id
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default Orders;