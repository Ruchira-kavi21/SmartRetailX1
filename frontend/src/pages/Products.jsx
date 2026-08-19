import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  createProduct,
} from "../services/productService";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    category: "",
  });

  const storedUser = localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to read stored user:", error);
  }

  const isAdmin = currentUser?.role === "ADMIN";

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts();

      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setFormError("");

    setFormData({
      name: "",
      description: "",
      sku: "",
      price: "",
      category: "",
    });

    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (creating) {
      return;
    }

    setShowAddModal(false);
    setFormError("");
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    setFormError("");

    const name = formData.name.trim();
    const description = formData.description.trim();
    const sku = formData.sku.trim();
    const category = formData.category.trim();
    const price = Number(formData.price);

    if (!name) {
      setFormError("Product name is required.");
      return;
    }

    if (!sku) {
      setFormError("SKU is required.");
      return;
    }

    if (!formData.price || Number.isNaN(price) || price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    if (!category) {
      setFormError("Category is required.");
      return;
    }

    try {
      setCreating(true);

      await createProduct({
        name,
        description: description || null,
        sku,
        price,
        category,
        stock: 0,
      });

      setShowAddModal(false);

      setFormData({
        name: "",
        description: "",
        sku: "",
        price: "",
        category: "",
      });

      await loadProducts();
    } catch (error) {
      console.error("Failed to create product:", error);

      if (error.status === 409) {
        setFormError(
          "A product with this SKU already exists."
        );
      } else if (error.status === 401) {
        setFormError(
          "Your session has expired. Please sign in again."
        );
      } else if (error.status === 403) {
        setFormError(
          "You do not have permission to create products."
        );
      } else {
        setFormError(
          error.message || "Failed to create product."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Products
        </h1>

        <p className="mt-2 text-slate-500">
          Loading products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Products
        </h1>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            SmartRetailX
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>

          <p className="mt-2 text-slate-500">
            Manage products and catalogue information.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No products found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no products in the catalogue.
          </p>

          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {product.name}
                </h2>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    product.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              {product.description && (
                <p className="mt-2 text-sm text-slate-500">
                  {product.description}
                </p>
              )}

              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    SKU
                  </span>

                  <span className="font-medium text-slate-900">
                    {product.sku}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Category
                  </span>

                  <span className="font-medium text-slate-900">
                    {product.category}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Price
                  </span>

                  <span className="font-semibold text-slate-900">
                    Rs. {product.price}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <span className="text-sm font-medium text-blue-600">
                  View details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Add Product
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a new product in the catalogue.
              </p>
            </div>

            {/* Form Error */}
            {formError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleCreateProduct}
              className="mt-6 space-y-5"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  disabled={creating}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="3"
                  disabled={creating}
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g. WM-002"
                  disabled={creating}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  disabled={creating}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Electronics"
                  disabled={creating}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={creating}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;