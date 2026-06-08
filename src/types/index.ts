export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Guardian {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface StudentEnrollment {
  // Dados pessoais
  fullName: string;
  socialName: string;
  birthDate: string;
  gender: string;
  cpf: string;
  rg: string;
  nationality: string;
  birthPlace: string;

  // Contato
  email: string;
  phone: string;
  whatsapp: string;

  // Endereço
  address: Address;

  // Dados acadêmicos
  courseLevel: string;
  courseName: string;
  shift: string;
  previousSchool: string;
  yearOfCompletion: string;

  // Responsável (para menores)
  guardian: Guardian;

  // Esportes
  sportsInterests: string[];

  // Informações adicionais
  specialNeeds: string;
  medicalInfo: string;
  howFoundUs: string;
  observations: string;

  // Termos
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

export interface UserRegistration {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  userType: 'aluno' | 'responsavel' | 'professor' | 'funcionario';
  acceptTerms: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export type EnrollmentStep = 'personal' | 'contact' | 'academic' | 'guardian' | 'additional' | 'review';

export const INITIAL_ENROLLMENT: StudentEnrollment = {
  fullName: '',
  socialName: '',
  birthDate: '',
  gender: '',
  cpf: '',
  rg: '',
  nationality: 'Brasileira',
  birthPlace: '',

  email: '',
  phone: '',
  whatsapp: '',

  address: {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  },

  courseLevel: '',
  courseName: '',
  shift: '',
  previousSchool: '',
  yearOfCompletion: '',

  guardian: {
    name: '',
    cpf: '',
    phone: '',
    email: '',
    relationship: '',
  },

  sportsInterests: [],

  specialNeeds: '',
  medicalInfo: '',
  howFoundUs: '',
  observations: '',

  acceptTerms: false,
  acceptPrivacy: false,
  acceptMarketing: false,
};

export const INITIAL_REGISTRATION: UserRegistration = {
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  password: '',
  confirmPassword: '',
  userType: 'aluno',
  acceptTerms: false,
};

export const INITIAL_LOGIN: UserLogin = {
  email: '',
  password: '',
  rememberMe: false,
};
