const AUTH_API = import.meta.env.VITE_AUTH_API_URL;
const AUTH_API_URL = `${AUTH_API}/api/v1/auth`;

const login = async (email, password) => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("token", data.data.token);
  localStorage.setItem("user", JSON.stringify(data.data.user));

  return data;
};

const register = async (name, email, password) => {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

const getProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${AUTH_API_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getToken = () => {
  return localStorage.getItem("token");
};

const getUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

export {
  login,
  register,
  getProfile,
  logout,
  getToken,
  getUser,
  isAuthenticated,
};