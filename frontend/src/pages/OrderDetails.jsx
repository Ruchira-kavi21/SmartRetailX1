import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getOrderById,
  updateOrderStatus,
} from "../services/orderService";

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrderById(id);

        setOrder(response.data);
      } catch (error) {
        console.error("Failed to load order:", error);

        if (error.status === 403) {
          setError(
            "You do not have permission to view this order."
          );
        } else if (error.status === 404) {
          setError("Order not found.");
        } else if (error.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else {
          setError(
            error.message || "Failed to load order details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    if (!order || order.status !== "PENDING") {
      return;
    }

    const action =
      status === "CONFIRMED"
        ? "confirm"
        : "cancel";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} order #${order.id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await updateOrderStatus(
        order.id,
        status
      );

      setOrder(response.data);

      setSuccess(
        status === "CONFIRMED"
          ? "Order confirmed successfully."
          : "Order cancelled successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      if (error.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setError(
          "You do not have permission to update this order."
        );
      } else if (error.status === 404) {
        setError("Order not found.");
      } else {
        setError(
          error.message ||
            "Failed to update order status."
        );
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Orders
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Order Details
        </h1>

        <p className="mt-2 text-slate-500">
          View information about order #{id}.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            Loading order details...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Unable to load order
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <Link
            to="/orders"
            className="mt-4 inline-block font-medium text-red-700 hover:text-red-800"
          >
            ← Return to Orders
          </Link>
        </div>
      )}

      {/* Success */}
      {!loading && success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Order Details */}
      {!loading && !error && order && (
        <div className="space-y-6">

          {/* Order Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Order ID
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  #{order.id}
                </h2>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>

            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && order.status === "PENDING" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Order Actions
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    This order is waiting for administrator approval.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusUpdate("CONFIRMED")
                    }
                    disabled={updatingStatus}
                    className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingStatus
                      ? "Updating..."
                      : "Confirm Order"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusUpdate("CANCELLED")
                    }
                    disabled={updatingStatus}
                    className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingStatus
                      ? "Updating..."
                      : "Cancel Order"}
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* Order Information */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Order Information
              </h2>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">

              <div>
                <p className="text-sm text-slate-500">
                  User ID
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  #{order.userId}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Product ID
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  #{order.productId}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Quantity
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {order.quantity}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Amount
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  LKR{" "}
                  {Number(
                    order.totalAmount
                  ).toLocaleString()}
                </p>
              </div>

            </div>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Order Timeline
              </h2>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">

              <div>
                <p className="text-sm text-slate-500">
                  Created
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Last Updated
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(order.updatedAt)}
                </p>
              </div>

            </div>
          </div>

          {/* Back Button */}
          <div>
            <Link
              to="/orders"
              className="inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Orders
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};

export default OrderDetails;