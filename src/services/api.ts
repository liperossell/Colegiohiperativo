/**
 * URL base da API. Em desenvolvimento, o proxy do Vite encaminha /api ao backend.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/** Erro de requisição HTTP com código de domínio retornado pela API. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  /**
   * @param message Mensagem legível para exibição ao usuário.
   * @param status Código HTTP da resposta.
   * @param code Código de erro de domínio retornado pela API.
   */
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Envia requisição GET à API do Hiperativo.
 * @param path - Caminho relativo (ex.: /api/auth/verify-email?token=...).
 * @param signal - Sinal opcional para cancelar a requisição (ex.: cleanup do React).
 */
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { signal });
  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiRequestError(
      data.message || 'Erro ao comunicar com o servidor.',
      response.status,
      data.code
    );
  }

  return data;
}

/**
 * Envia requisição POST JSON à API do Hiperativo.
 * @param path - Caminho relativo (ex.: /api/matriculas).
 * @param body - Payload a ser serializado como JSON.
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiRequestError(
      data.message || 'Erro ao comunicar com o servidor.',
      response.status,
      data.code
    );
  }

  return data;
}
