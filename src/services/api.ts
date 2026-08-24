/**
 * URL base da API. Em desenvolvimento, o proxy do Vite encaminha /api ao backend.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
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
    throw new Error(data.message || 'Erro ao comunicar com o servidor.');
  }

  return data;
}
