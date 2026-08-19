import { apiRequest } from "./api";

const PRODUCT_API = import.meta.env.VITE_PRODUCT_API_URL;

export const getProducts = async () => {
  return apiRequest(`${PRODUCT_API}/api/v1/products`);
};

export const getProductById = async (id) => {
  return apiRequest(`${PRODUCT_API}/api/v1/products/${id}`);
};

export const createProduct = async (product) => {
  return apiRequest(`${PRODUCT_API}/api/v1/products`, {
    method: "POST",
    body: JSON.stringify(product),
  });
};

export const updateProduct = async (id, product) => {
  return apiRequest(`${PRODUCT_API}/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
};

export const deleteProduct = async (id) => {
  return apiRequest(`${PRODUCT_API}/api/v1/products/${id}`, {
    method: "DELETE",
  });
};