import { apiRequest } from "./api";

const INVENTORY_API = import.meta.env.VITE_INVENTORY_API_URL;

export const getInventory = async () => {
  return apiRequest(`${INVENTORY_API}/api/v1/inventory`);
};

export const getInventoryByProduct = async (productId) => {
  return apiRequest(
    `${INVENTORY_API}/api/v1/inventory/${productId}`
  );
};

export const createInventory = async (inventory) => {
  return apiRequest(`${INVENTORY_API}/api/v1/inventory`, {
    method: "POST",
    body: JSON.stringify(inventory),
  });
};

export const deleteInventory = async (id) => {
  return apiRequest(
    `${INVENTORY_API}/api/v1/inventory/${id}`,
    {
      method: "DELETE",
    }
  );
};

export const updateInventory = async (id, inventory) => {
  return apiRequest(`${INVENTORY_API}/api/v1/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(inventory),
  });
};

export const reserveStock = async (productId, quantity) => {
  return apiRequest(
    `${INVENTORY_API}/api/v1/inventory/${productId}/reserve`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }
  );
};

export const updateStock = async (productId, quantity) => {
  return apiRequest(
    `${INVENTORY_API}/api/v1/inventory/${productId}/stock`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }
  );
};