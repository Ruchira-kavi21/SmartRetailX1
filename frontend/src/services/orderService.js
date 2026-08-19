import { apiRequest } from "./api";

const ORDER_API = import.meta.env.VITE_ORDER_API_URL;

export const getOrders = async () => {
  return apiRequest(`${ORDER_API}/api/v1/orders`);
};

export const getOrderById = async (id) => {
  return apiRequest(`${ORDER_API}/api/v1/orders/${id}`);
};

export const createOrder = async (order) => {
  return apiRequest(`${ORDER_API}/api/v1/orders`, {
    method: "POST",
    body: JSON.stringify(order),
  });
};

export const updateOrderStatus = async (id, status) => {
  return apiRequest(`${ORDER_API}/api/v1/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};