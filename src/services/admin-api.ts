import axios from "axios";
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
