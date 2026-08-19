import { useEffect, useState } from "react";
import {
  getInventory,
  createInventory,
  updateStock,
  deleteInventory,
} from "../services/inventoryService";
import { getProducts } from "../services/productService";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedInventory, setSelectedInventory] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  /*
   * Get logged-in user.
   *
   * This assumes your login system stores the user object
   * in localStorage.
   */
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const isAdmin = currentUser?.role === "ADMIN";

  /*
   * Load inventory and products.
   */
  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryResponse, productsResponse] =
        await Promise.all([
          getInventory(),
          getProducts(),
        ]);

      setInventory(inventoryResponse.data || []);
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);

      if (error.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setError(
          "You do not have permission to view inventory."
        );
      } else {
        setError(
          error.message || "Failed to load inventory."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  /*
   * Find product information using productId.
   */
  const getProduct = (productId) => {
    return products.find(
      (product) => product.id === productId
    );
  };

  /*
   * Get stock status.
   */
  const getStockStatus = (quantity, reserved) => {
    const available = quantity - reserved;

    if (available <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (available <= 10) {
      return {
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-100 text-green-700",
    };
  };

  /*
   * Format date.
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  /*
   * Clear messages.
   */
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /*
   * Open Add Inventory modal.
   */
  const openAddModal = () => {
    clearMessages();

    setSelectedProductId("");
    setNewQuantity("");

    setShowAddModal(true);
  };

  /*
   * Open Update Stock modal.
   */
  const openUpdateModal = (item) => {
    clearMessages();

    setSelectedInventory(item);

    /*
     * The backend expects the amount to add/remove.
     *
     * Example:
     * Current stock = 90
     * Enter +10 -> stock becomes 100
     * Enter -10 -> stock becomes 80
     */
    setNewQuantity("");

    setShowUpdateModal(true);
  };

  /*
   * Open Delete modal.
   */
  const openDeleteModal = (item) => {
    clearMessages();

    setSelectedInventory(item);

    setShowDeleteModal(true);
  };

  /*
   * Close all modals.
   */
  const closeModals = () => {
    if (actionLoading) {
      return;
    }

    setShowAddModal(false);
    setShowUpdateModal(false);
    setShowDeleteModal(false);

    setSelectedInventory(null);
    setSelectedProductId("");
    setNewQuantity("");
  };

  /*
   * Add inventory.
   */
  const handleAddInventory = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }

    const quantity = Number(newQuantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError(
        "Initial quantity must be a whole number greater than or equal to 0."
      );
      return;
    }

    try {
      setActionLoading(true);

      await createInventory({
        productId: Number(selectedProductId),
        quantity,
      });

      setSuccess(
        "Inventory record created successfully."
      );

      closeModals();

      await loadInventory();
    } catch (error) {
      console.error("Failed to create inventory:", error);

      if (error.status === 409) {
        setError(
          "Inventory already exists for this product."
        );
      } else if (error.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setError(
          "Only administrators can create inventory."
        );
      } else {
        setError(
          error.message || "Failed to create inventory."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Update stock.
   */
  const handleUpdateStock = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!selectedInventory) {
      return;
    }

    const quantity = Number(newQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity === 0
    ) {
      setError(
        "Enter a whole number other than 0."
      );
      return;
    }

    /*
     * Prevent removing more stock than is available.
     */
    const available =
      selectedInventory.quantity -
      selectedInventory.reserved;

    if (quantity < 0 && Math.abs(quantity) > available) {
      setError(
        `You cannot remove ${Math.abs(
          quantity
        )} units. Only ${available} units are available.`
      );
      return;
    }

    try {
      setActionLoading(true);

      await updateStock(
        selectedInventory.productId,
        quantity
      );

      setSuccess(
        "Inventory stock updated successfully."
      );

      closeModals();

      await loadInventory();
    } catch (error) {
      console.error("Failed to update stock:", error);

      if (error.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setError(
          "Only administrators can update inventory."
        );
      } else {
        setError(
          error.message || "Failed to update stock."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Delete inventory.
   */
  const handleDeleteInventory = async () => {
    clearMessages();

    if (!selectedInventory) {
      return;
    }

    try {
      setActionLoading(true);

      await deleteInventory(selectedInventory.id);

      setSuccess(
        "Inventory deleted successfully."
      );

      closeModals();

      await loadInventory();
    } catch (error) {
      console.error("Failed to delete inventory:", error);

      if (error.status === 400) {
        setError(
          error.message ||
            "Cannot delete inventory with reserved stock."
        );
      } else if (error.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setError(
          "Only administrators can delete inventory."
        );
      } else {
        setError(
          error.message || "Failed to delete inventory."
        );
      }

      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Products that do not already have inventory.
   *
   * These are the only products that should appear
   * in the Add Inventory dropdown.
   */
  const availableProducts = products.filter(
    (product) =>
      !inventory.some(
        (item) => item.productId === product.id
      )
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            SmartRetailX
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor stock levels and reserved inventory.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Inventory
          </button>
        )}
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

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
            Loading inventory...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        inventory.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No inventory records found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no inventory records.
            </p>

            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add Inventory
              </button>
            )}
          </div>
        )}

      {/* Inventory Table */}
      {!loading &&
        !error &&
        inventory.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Inventory ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reserved
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Available
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Updated
                    </th>

                    {isAdmin && (
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {inventory.map((item) => {
                    const product = getProduct(
                      item.productId
                    );

                    const available =
                      item.quantity - item.reserved;

                    const stockStatus =
                      getStockStatus(
                        item.quantity,
                        item.reserved
                      );

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          #{item.id}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {product?.name ||
                                "Unknown Product"}
                            </p>

                            {product?.sku && (
                              <p className="mt-1 text-xs text-slate-500">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          #{item.productId}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                          {item.quantity}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {item.reserved}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          {available}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            item.updatedAt
                          )}
                        </td>

                        {isAdmin && (
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openUpdateModal(item)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Update Stock
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(item)
                                }
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Add Inventory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create an inventory record for a product.
              </p>
            </div>

            <form
              onSubmit={handleAddInventory}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Product
                </label>

                <select
                  value={selectedProductId}
                  onChange={(event) =>
                    setSelectedProductId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select a product
                  </option>

                  {availableProducts.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} -{" "}
                        {product.sku}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Initial Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newQuantity}
                  onChange={(event) =>
                    setNewQuantity(
                      event.target.value
                    )
                  }
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={actionLoading}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading
                    ? "Creating..."
                    : "Create Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateModal &&
        selectedInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Update Stock
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {getProduct(
                    selectedInventory.productId
                  )?.name || "Unknown Product"}
                </p>
              </div>

              <div className="mb-5 rounded-lg bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Current Stock
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {selectedInventory.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Reserved
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {selectedInventory.reserved}
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleUpdateStock}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Stock Adjustment
                  </label>

                  <input
                    type="number"
                    step="1"
                    value={newQuantity}
                    onChange={(event) =>
                      setNewQuantity(
                        event.target.value
                      )
                    }
                    placeholder="Example: 10 or -5"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Use a positive number to add stock.
                    Use a negative number to remove
                    stock.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModals}
                    disabled={actionLoading}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading
                      ? "Updating..."
                      : "Update Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal &&
        selectedInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xl text-red-600">
                    !
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Delete Inventory?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete the
                  inventory record for{" "}
                  <span className="font-semibold text-slate-700">
                    {getProduct(
                      selectedInventory.productId
                    )?.name ||
                      "Unknown Product"}
                  </span>
                  ?
                </p>
              </div>

              <div className="mb-6 rounded-lg bg-slate-50 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedInventory.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Reserved
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedInventory.reserved}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Available
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedInventory.quantity -
                        selectedInventory.reserved}
                    </p>
                  </div>
                </div>
              </div>

              {selectedInventory.reserved > 0 && (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                  <p className="text-sm font-medium text-yellow-800">
                    This inventory has reserved stock.
                    The system will not allow it to be
                    deleted until the reserved stock is
                    cleared.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={actionLoading}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteInventory}
                  disabled={
                    actionLoading ||
                    selectedInventory.reserved > 0
                  }
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Deleting..."
                    : "Delete Inventory"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Inventory;