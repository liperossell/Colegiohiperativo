import type { StudentEnrollment, UserRegistration } from '../types';
import { calculateAge, digitsOnly } from '../utils/validation';
import { apiGet, apiPost } from './api';

interface MatriculaResponse {
  id: string;
  protocolo: string;
  message: string;
}

interface UsuarioResponse {
  id: string;
  message: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
  };
}

interface VerifyEmailResponse {
  ok: boolean;
  message: string;
  alreadyActivated?: boolean;
  user?: {
    id: string;
    email: string;
    full_name: string;
    email_verified: boolean;
  };
}

interface ContatoResponse {
  id: string;
  message: string;
}

/**
 * Converte o formulário de matrícula do frontend para o payload da API.
 * @param form - Estado completo do formulário de matrícula.
 */
export function buildMatriculaPayload(form: StudentEnrollment) {
  const isMinor = form.birthDate ? calculateAge(form.birthDate) < 18 : false;

  return {
    full_name: form.fullName.trim(),
    social_name: form.socialName.trim(),
    birth_date: form.birthDate,
    gender: form.gender,
    cpf: digitsOnly(form.cpf),
    rg: form.rg.trim(),
    nationality: form.nationality.trim(),
    birth_place: form.birthPlace.trim(),
    email: form.email.trim(),
    phone: digitsOnly(form.phone),
    whatsapp: digitsOnly(form.whatsapp),
    address_cep: digitsOnly(form.address.cep),
    address_street: form.address.street.trim(),
    address_number: form.address.number.trim(),
    address_complement: form.address.complement.trim(),
    address_neighborhood: form.address.neighborhood.trim(),
    address_city: form.address.city.trim(),
    address_state: form.address.state,
    course_level: form.courseLevel,
    course_name: form.courseName,
    shift: form.shift,
    previous_school: form.previousSchool.trim(),
    year_of_completion: form.yearOfCompletion.trim(),
    guardian: isMinor
      ? {
          name: form.guardian.name.trim(),
          cpf: digitsOnly(form.guardian.cpf),
          phone: digitsOnly(form.guardian.phone),
          email: form.guardian.email.trim(),
          relationship: form.guardian.relationship,
        }
      : null,
    sports_interests: form.sportsInterests,
    special_needs: form.specialNeeds.trim(),
    medical_info: form.medicalInfo.trim(),
    how_found_us: form.howFoundUs,
    observations: form.observations.trim(),
    accept_terms: true,
    accept_privacy: true,
    accept_marketing: form.acceptMarketing,
  };
}

/**
 * Registra matrícula no backend.
 * @param form - Dados do formulário de matrícula.
 */
export async function submitMatricula(form: StudentEnrollment): Promise<MatriculaResponse> {
  return apiPost<MatriculaResponse>('/api/matriculas', buildMatriculaPayload(form));
}

/**
 * Cria conta de usuário no backend.
 * @param form - Dados do formulário de cadastro.
 */
export async function submitRegistro(form: UserRegistration): Promise<UsuarioResponse> {
  return apiPost<UsuarioResponse>('/api/usuarios', {
    full_name: form.fullName.trim(),
    email: form.email.trim(),
    phone: digitsOnly(form.phone),
    cpf: digitsOnly(form.cpf),
    password: form.password,
    user_type: form.userType,
    accept_terms: true,
  });
}

/**
 * Autentica usuário e retorna token JWT.
 * @param email - E-mail do usuário.
 * @param password - Senha em texto.
 * @param rememberMe - Se deve usar sessão prolongada.
 */
export async function submitLogin(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/api/auth/login', {
    email: email.trim(),
    password,
    remember_me: rememberMe,
  });
}

const activationRequests = new Map<string, Promise<VerifyEmailResponse>>();

/**
 * Ativa a conta do usuário a partir do token recebido por e-mail.
 * Reutiliza a mesma requisição quando o React Strict Mode monta o efeito duas vezes.
 * @param token Token criptografado presente no link de ativação.
 */
export async function verifyAccountActivation(token: string): Promise<VerifyEmailResponse> {
  const cached = activationRequests.get(token);
  if (cached) {
    return cached;
  }

  const encodedToken = encodeURIComponent(token);
  const request = apiGet<VerifyEmailResponse>(
    `/api/auth/verify-email?token=${encodedToken}`
  ).catch((error) => {
    activationRequests.delete(token);
    throw error;
  });

  activationRequests.set(token, request);
  return request;
}

/**
 * Envia mensagem do formulário de contato.
 * @param payload - Dados do formulário de contato.
 */
export async function submitContato(payload: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<ContatoResponse> {
  return apiPost<ContatoResponse>('/api/contato', {
    nome: payload.name.trim(),
    email: payload.email.trim(),
    telefone: digitsOnly(payload.phone),
    assunto: payload.subject,
    mensagem: payload.message.trim(),
  });
}
