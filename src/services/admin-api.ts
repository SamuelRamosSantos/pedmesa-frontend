import axios from "axios";
import { getStoredSuperAdminToken } from "../lib/super-admin-auth-storage";
import { API_BASE_URL } from "./api";

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
});

adminApi.interceptors.request.use((config) => {
  const token = getStoredSuperAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
