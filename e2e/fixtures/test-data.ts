/**
 * Dados fictícios para testes E2E.
 * CPFs são válidos pelo algoritmo, mas não pertencem a pessoas reais.
 */
export const VALID_CPFS = {
  student: '529.982.247-25',
  guardian: '390.533.447-05',
  account: '111.444.777-35',
} as const;

/**
 * Formata 11 dígitos numéricos como CPF brasileiro.
 * @param digits - CPF apenas com números.
 */
export function formatCpf(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Gera CPF válido a partir de uma semente numérica.
 * @param seed - Valor base para os 9 primeiros dígitos.
 */
function buildValidCpfFromSeed(seed: number): string {
  const base = String(Math.abs(seed) % 1_000_000_000).padStart(9, '0');

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(base[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  const digit1 = remainder;

  sum = 0;
  const partial = `${base}${digit1}`;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(partial[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  const digit2 = remainder;

  return `${base}${digit1}${digit2}`;
}

/**
 * Gera CPF válido e único por execução de teste.
 */
export function uniqueCpf(): string {
  const seed = Date.now() + Math.floor(Math.random() * 10_000);
  return formatCpf(buildValidCpfFromSeed(seed));
}

/**
 * Gera e-mail único por execução para evitar conflito no backend real.
 * @param prefix - Prefixo do endereço de e-mail.
 */
export function uniqueEmail(prefix: string): string {
  const stamp = Date.now();
  return `${prefix}.${stamp}@teste.hiperativo.local`;
}

export const enrollmentAdult = {
  fullName: 'Maria Clara Souza Oliveira',
  socialName: 'Clara',
  birthDate: '1998-06-12',
  gender: 'feminino',
  cpf: VALID_CPFS.student,
  rg: '45.678.901-2',
  nationality: 'Brasileira',
  birthPlace: 'São Paulo/SP',
  phone: '(11) 98765-4321',
  whatsapp: '(11) 91234-5678',
  address: {
    cep: '01310-100',
    number: '1500',
    complement: 'Apto 42',
  },
  academic: {
    courseLevel: 'graduacao',
    courseName: 'Pedagogia',
    shift: 'noturno',
    previousSchool: 'E.E. Prof. João Mendes',
    yearOfCompletion: '2016',
  },
  additional: {
    sports: ['natacao', 'capoeira'],
    specialNeeds: 'Nenhuma',
    medicalInfo: 'Sem alergias conhecidas',
    howFoundUs: 'google',
    observations: 'Matrícula solicitada via teste automatizado Playwright.',
  },
} as const;

export const enrollmentMinor = {
  ...enrollmentAdult,
  fullName: 'Pedro Henrique Souza Oliveira',
  socialName: '',
  birthDate: '2012-04-20',
  cpf: '802.554.579-28',
  guardian: {
    name: 'Ana Paula Souza Oliveira',
    cpf: VALID_CPFS.guardian,
    relationship: 'mae',
    phone: '(11) 97654-3210',
  },
} as const;

export const registrationData = {
  fullName: 'Lucas Ferreira Santos',
  phone: '(11) 99887-7665',
  cpf: VALID_CPFS.account,
  password: 'Senha@123',
  userType: 'aluno',
} as const;
