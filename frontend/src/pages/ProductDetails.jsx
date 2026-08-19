import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProductById } from "../services/productService";
import { getInventory } from "../services/inventoryService";
import { createOrder } from "../services/orderService";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [inventoryItem, setInventoryItem] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const [productResponse, inventoryResponse] =
          await Promise.all([
            getProductById(id),
            getInventory(),
          ]);

        setProduct(productResponse.data);

        const inventoryRecords = inventoryResponse.data || [];

        const matchingInventory = inventoryRecords.find(
          (item) => Number(item.productId) === Number(id)
        );

        setInventoryItem(matchingInventory || null);
      } catch (error) {
        console.error("Failed to load product:", error);

        if (error.status === 401) {
          setError(
            "Your session has expired. Please sign in again."
          );
        } else if (error.status === 403) {
          setError(
            "You do not have permission to view this product."
          );
        } else if (error.status === 404) {
          setError("Product not found.");
        } else {
          setError(
            error.message || "Failed to load product."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const getAvailableStock = () => {
    if (!inventoryItem) {
      return 0;
    }

    return (
      Number(inventoryItem.quantity || 0) -
      Number(inventoryItem.reserved || 0)
    );
  };

  const availableStock = getAvailableStock();

  const getStockStatus = () => {
    if (availableStock <= 0) {
      return {
        label: "Out of Stock",
        className: "text-red-600",
      };
    }

    if (availableStock <= 10) {
      return {
        label: "Low Stock",
        className: "text-yellow-600",
      };
    }

    return {
      label: "In Stock",
      className: "text-green-600",
    };
  };

  const stockStatus = getStockStatus();

  const increaseQuantity = () => {
    setQuantity((current) => {
      if (current >= availableStock) {
        return current;
      }

      return current + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => {
      if (current <= 1) {
        return 1;
      }

      return current - 1;
    });
  };

  const openOrderModal = () => {
    setOrderError("");
    setQuantity(1);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    if (ordering) {
      return;
    }

    setShowOrderModal(false);
    setOrderError("");
    setQuantity(1);
  };

  const handleCreateOrder = async () => {
    if (!product) {
      return;
    }

    if (availableStock <= 0) {
      setOrderError("This product is currently out of stock.");
      return;
    }

    if (quantity > availableStock) {
      setOrderError(
        `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available.`
      );
      return;
    }

    try {
      setOrdering(true);
      setOrderError("");

      const price = Number(product.price);
      const totalAmount = price * quantity;

      const response = await createOrder({
        productId: Number(product.id),
        quantity,
        totalAmount,
      });

      const createdOrder = response.data;

      setShowOrderModal(false);

      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      if (error.status === 401) {
        setOrderError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setOrderError(
          "You do not have permission to place this order."
        );
      } else if (error.status === 409) {
        setOrderError(
          error.message ||
            "The requested quantity is no longer available."
        );
      } else {
        setOrderError(
          error.message || "Failed to place the order."
        );
      }
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Product Details
        </h1>

        <p className="mt-2 text-slate-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Product Details
        </h1>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

        <Link
          to="/products"
          className="mt-5 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Product Not Found
        </h1>

        <Link
          to="/products"
          className="mt-5 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  const totalAmount =
    Number(product.price) * quantity;

  return (
    <div>
      {/* Back */}
      <Link
        to="/products"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to Products
      </Link>

      {/* Product Card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {product.name}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {product.status}
              </span>
            </div>

            <p className="mt-3 text-slate-500">
              {product.description ||
                "No description available."}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500">
              Price
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              LKR{" "}
              {Number(product.price).toLocaleString()}
            </p>

            <p
              className={`mt-2 text-sm font-medium ${stockStatus.className}`}
            >
              {stockStatus.label}
            </p>
          </div>
        </div>

        {/* Product Information */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              SKU
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {product.sku}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Category
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {product.category}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Available Stock
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {availableStock}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Status
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {product.status}
            </p>
          </div>
        </div>

        {/* Inventory Information */}
        {inventoryItem && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Inventory Information
            </h2>

            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">
                  Total Quantity
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {inventoryItem.quantity}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Reserved
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {inventoryItem.reserved}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Available
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {availableStock}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Button */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={openOrderModal}
            disabled={
              availableStock <= 0 ||
              product.status !== "ACTIVE"
            }
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            {availableStock <= 0
              ? "Out of Stock"
              : "Order Now"}
          </button>
        </div>

        {/* Product Information */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Product Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">
                Created
              </p>

              <p className="mt-1 text-sm text-slate-900">
                {new Date(
                  product.createdAt
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Last Updated
              </p>

              <p className="mt-1 text-sm text-slate-900">
                {new Date(
                  product.updatedAt
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Place Order
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Confirm your order details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeOrderModal}
                disabled={ordering}
                className="text-xl text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            {/* Product */}
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {product.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    SKU: {product.sku}
                  </p>
                </div>

                <p className="font-semibold text-slate-900">
                  LKR{" "}
                  {Number(
                    product.price
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Quantity
                </label>

                <span className="text-sm text-slate-500">
                  Available: {availableStock}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-center rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={
                    ordering || quantity <= 1
                  }
                  className="px-5 py-3 text-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  −
                </button>

                <div className="min-w-16 text-center text-lg font-semibold text-slate-900">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    ordering ||
                    quantity >= availableStock
                  }
                  className="px-5 py-3 text-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Error */}
            {orderError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {orderError}
              </div>
            )}

            {/* Total */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-sm font-medium text-slate-500">
                Total
              </span>

              <span className="text-xl font-bold text-slate-900">
                LKR{" "}
                {totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeOrderModal}
                disabled={ordering}
                className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={ordering || availableStock <= 0}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {ordering
                  ? "Placing Order..."
                  : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;