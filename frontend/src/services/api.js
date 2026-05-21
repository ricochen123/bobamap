import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function setAuthTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearAuthTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    refreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
      setAuthTokens(data.access, refresh);
      queue.forEach(({ resolve }) => resolve(data.access));
      queue = [];
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (err) {
      clearAuthTokens();
      queue.forEach(({ reject }) => reject(err));
      queue = [];
      return Promise.reject(err);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
