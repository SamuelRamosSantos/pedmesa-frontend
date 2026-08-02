import axios from "axios";
import { getStoredToken, getStoredUser } from "../lib/auth-storage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  const user = getStoredUser();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user?.tenant_id) {
    config.headers["X-Tenant-ID"] = user.tenant_id;
  }

  return config;
});
