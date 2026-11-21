import axios from "axios";
import { clearStoredUser } from "../lib/auth-storage";
import { getStoredSuperAdminUser } from "../lib/super-admin-auth-storage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

// PED-76: o token de sessão viaja num cookie HttpOnly (nunca visível a JS) que o
// navegador anexa sozinho — withCredentials é o que faz o axios efetivamente
// incluir esse cookie em requisições. Não existe mais nenhum header manual de
// autenticação pra montar aqui.
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// PED-77: revalida a sessão em qualquer chamada autenticada, não só no login.
let isHandlingSessionExpired = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = typeof error.config?.url === "string" && error.config.url.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest && !isHandlingSessionExpired) {
      isHandlingSessionExpired = true;
      clearStoredUser();
      api.post("/auth/logout").catch(() => {});

      // Um super-admin impersonando um tenant mantém a própria sessão válida
      // mesmo quando só o token de impersonation (30min) expira — nesse caso
      // volta pro painel dele, não faz sentido jogar pro /login geral.
      window.location.href = getStoredSuperAdminUser() ? "/admin" : "/login";
    }

    return Promise.reject(error);
  }
);
