/**
 * Perfil do usuário autenticado armazenado no navegador.
 */
export interface StoredUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  user_type: string;
}

/**
 * Recupera o usuário autenticado salvo no localStorage.
 * @returns Dados do usuário ou null quando não há sessão.
 */
export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem('hiperativo_user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Verifica se há token de autenticação ativo no navegador.
 * @returns true quando o usuário está autenticado.
 */
export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('hiperativo_token'));
}
