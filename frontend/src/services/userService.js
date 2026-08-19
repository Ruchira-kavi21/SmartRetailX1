import { apiRequest } from "./api";

const AUTH_API = import.meta.env.VITE_AUTH_API_URL;

export const getUsers = async () => {
  return apiRequest(`${AUTH_API}/api/v1/auth/users`);
};

export const updateUserRole = async (id, role) => {
  return apiRequest(
    `${AUTH_API}/api/v1/auth/users/${id}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }
  );
};

export const deleteUser = async (id) => {
  return apiRequest(
    `${AUTH_API}/api/v1/auth/users/${id}`,
    {
      method: "DELETE",
    }
  );
};