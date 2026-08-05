import { api } from "./api";
import type { UserRole } from "../types/auth";
import type { Usuario } from "../types/usuario";

export interface CreateUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  roles: UserRole[];
  pode_excluir_item_fechamento: boolean;
}

export interface UpdateUsuarioPayload {
  nome: string;
  email: string;
  roles: UserRole[];
  pode_excluir_item_fechamento: boolean;
}

export interface AlterarSenhaResponse {
  mensagem: string;
}

export async function listUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>("/usuarios");
  return data;
}

export async function createUsuario(payload: CreateUsuarioPayload): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/usuarios", payload);
  return data;
}

export async function updateUsuario(id: string, payload: UpdateUsuarioPayload): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/usuarios/${id}`, payload);
  return data;
}

export async function updateUsuarioAtivo(id: string, ativo: boolean): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${id}/ativo`, { ativo });
  return data;
}

export async function alterarSenhaUsuario(id: string, novaSenha: string): Promise<AlterarSenhaResponse> {
  const { data } = await api.patch<AlterarSenhaResponse>(`/usuarios/${id}/senha`, { nova_senha: novaSenha });
  return data;
}
