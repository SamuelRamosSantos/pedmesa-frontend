import axios from "axios";
import { clearStoredSuperAdminUser } from "../lib/super-admin-auth-storage";
import { API_BASE_URL } from "./api";

// PED-76: instância separada de `api` (não porque a autenticação funcione de
// forma diferente — os dois cookies HttpOnly viajam juntos automaticamente,
// withCredentials igual — mas pra manter o limite de import explícito entre
// chamadas de tenant e de super-admin, já que são sessões e permissões
// completamente distintas no backend).
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// PED-77: mesma lógica de api.ts, mas pra sessão de super-admin. Não existe o
// equivalente à checagem de impersonation aqui — uma sessão de tenant ativa não
// tem relação com a de super-admin (impersonation só aninha nesse sentido, nunca
// no contrário), então expirar sempre manda pro /login.
let isHandlingSessionExpired = false;

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = typeof error.config?.url === "string" && error.config.url.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest && !isHandlingSessionExpired) {
      isHandlingSessionExpired = true;
      clearStoredSuperAdminUser();
      adminApi.post("/auth/admin-logout").catch(() => {});
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
