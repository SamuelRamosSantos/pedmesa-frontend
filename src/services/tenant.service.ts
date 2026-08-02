import { api } from "./api";
import type { Tenant } from "../types/tenant";

export async function getTenantMe(): Promise<Tenant> {
  const { data } = await api.get<Tenant>("/tenants/me");
  return data;
}
