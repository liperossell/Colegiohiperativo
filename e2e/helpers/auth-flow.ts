const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';

export interface RegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  userType: 'aluno' | 'responsavel' | 'professor' | 'funcionario';
}

export interface RegistrationResponse {
  id: string;
  protocolo: string;
  message: string;
  meta?: {
    activation_link?: string;
  };
}

/**
 * Cadastra usuário via API e retorna o link de ativação gerado pelo backend.
 * @param payload Dados do formulário de cadastro.
 */
export async function registerUserAndGetActivationLink(
  payload: RegistrationPayload,
): Promise<RegistrationResponse> {
  const response = await fetch(`${API_BASE}/api/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone.replace(/\D/g, ''),
      cpf: payload.cpf.replace(/\D/g, ''),
      password: payload.password,
      user_type: payload.userType,
      accept_terms: true,
    }),
  });

  const data = (await response.json()) as RegistrationResponse & { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Falha ao cadastrar usuário para teste E2E.');
  }

  const activationLink = data.meta?.activation_link;
  if (!activationLink) {
    throw new Error('Resposta de cadastro não retornou activation_link.');
  }

  return {
    ...data,
    meta: { activation_link: activationLink },
  };
}

/**
 * Converte URL absoluta de ativação em rota relativa para page.goto do Playwright.
 * @param activationLink URL completa retornada pela API de cadastro.
 */
export function toActivationRoute(activationLink: string): string {
  const url = new URL(activationLink);
  return `${url.pathname}${url.search}`;
}

/**
 * Retorna o link de ativação da resposta padronizada de cadastro.
 * @param registration Resposta da API de cadastro de usuário.
 */
export function getActivationLink(registration: RegistrationResponse): string {
  const link = registration.meta?.activation_link;
  if (!link) {
    throw new Error('Resposta de cadastro não retornou activation_link.');
  }
  return link;
}
