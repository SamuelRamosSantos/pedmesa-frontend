import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

// PED-76: o token de sessão viaja num cookie HttpOnly (nunca visível a JS) que o
// navegador anexa sozinho — withCredentials é o que faz o axios efetivamente
// incluir esse cookie em requisições. Não existe mais nenhum header manual de
// autenticação pra montar aqui.
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
