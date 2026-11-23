import axios from "axios";

interface ApiErrorResponse {
  message: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    error.response?.data?.message
  ) {
    return error.response.data.message;
  }

  return fallback;
}

// Status HTTP da resposta de erro (ex.: 409 de concorrência), ou null sem resposta.
export function getApiErrorStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
}
