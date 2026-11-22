import { api } from "./api";

export interface UploadImagemResponse {
  url: string;
}

export async function uploadImagem(file: File): Promise<UploadImagemResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadImagemResponse>("/uploads", formData);
  return data;
}
