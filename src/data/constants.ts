export const BRAND = {
  name: 'Colégio Faculdade Hiperativo',
  shortName: 'Hiperativo',
  logoTitle: 'Colégio Hiperativo',
  logoSubtitle: 'Faculdade',
  slogan: 'Educação que Transforma, Mentes que Brilham',
  tagline: 'Do Ensino Fundamental ao Mestrado — Formação Integral para Toda a Vida',
  emoji: '🎓⚡',
  description:
    'Instituição de ensino completa que oferece educação integral do Ensino Fundamental à Graduação, com Especializações, Mestrados e Cursos Técnicos. Desenvolvemos mentes brilhantes com excelência acadêmica e atividades esportivas.',
  contact: {
    phone: '(11) 3456-7890',
    whatsapp: '(11) 99876-5432',
    email: 'contato@colegiohiperativo.edu.br',
    address: 'Av. da Educação, 1500 — Centro, São Paulo — SP',
  },
  social: {
    instagram: '@colegiohiperativo',
    facebook: 'colegiohiperativo',
    youtube: 'ColegioFaculdadeHiperativo',
  },
} as const;

export const NAV_LINKS = [
  { label: 'Início', path: '/' },
  { label: 'Sobre', path: '/sobre' },
  { label: 'Cursos', path: '/cursos' },
  { label: 'Esportes', path: '/esportes' },
  { label: 'Matrícula', path: '/matricula' },
  { label: 'Contato', path: '/contato' },
] as const;

export const COURSE_LEVELS = [
  {
    id: 'fundamental',
    title: 'Ensino Fundamental',
    emoji: '📚',
    description: 'Anos iniciais e finais com metodologia ativa e acompanhamento personalizado.',
    ageRange: '6 a 14 anos',
    duration: '9 anos',
  },
  {
    id: 'medio',
    title: 'Ensino Médio',
    emoji: '🎯',
    description: 'Preparação completa para vestibular, ENEM e mercado de trabalho.',
    ageRange: '15 a 17 anos',
    duration: '3 anos',
  },
  {
    id: 'tecnico',
    title: 'Cursos Técnicos',
    emoji: '🔧',
    description: 'Formação profissionalizante integrada ao ensino médio.',
    ageRange: 'A partir de 15 anos',
    duration: '1 a 2 anos',
  },
  {
    id: 'graduacao',
    title: 'Graduação',
    emoji: '🎓',
    description: 'Bacharelado, Licenciatura e Tecnólogo em diversas áreas.',
    ageRange: 'A partir de 18 anos',
    duration: '2 a 5 anos',
  },
  {
    id: 'especializacao',
    title: 'Especialização',
    emoji: '📊',
    description: 'Pós-graduação lato sensu para aprofundamento profissional.',
    ageRange: 'Graduados',
    duration: '6 a 18 meses',
  },
  {
    id: 'mestrado',
    title: 'Mestrado',
    emoji: '🔬',
    description: 'Pós-graduação stricto sensu com foco em pesquisa e inovação.',
    ageRange: 'Graduados',
    duration: '2 anos',
  },
] as const;

export const SPORTS = [
  { id: 'natacao', name: 'Natação', emoji: '🏊', description: 'Desenvolvimento aquático e condicionamento físico completo.' },
  { id: 'karate', name: 'Karatê', emoji: '🥋', description: 'Artes marciais para disciplina, foco e autodefesa.' },
  { id: 'capoeira', name: 'Capoeira', emoji: '🤸', description: 'Cultura afro-brasileira, ritmo e expressão corporal.' },
  { id: 'futebol', name: 'Futebol Society', emoji: '⚽', description: 'Trabalho em equipe e habilidades motoras.' },
  { id: 'volei', name: 'Vôlei', emoji: '🏐', description: 'Coordenação, reflexos e espírito coletivo.' },
  { id: 'basquete', name: 'Basquete', emoji: '🏀', description: 'Agilidade, estratégia e dinamismo.' },
  { id: 'judo', name: 'Judô', emoji: '🤼', description: 'Respeito, equilíbrio e técnica de queda.' },
] as const;

export const GRADUATION_COURSES = [
  'Administração', 'Pedagogia', 'Enfermagem', 'Engenharia Civil',
  'Direito', 'Psicologia', 'Sistemas de Informação', 'Educação Física',
  'Contabilidade', 'Marketing', 'Fisioterapia', 'Nutrição',
] as const;

export const TECHNICAL_COURSES = [
  'Informática', 'Enfermagem', 'Administração', 'Edificações',
  'Eletrotécnica', 'Nutrição', 'Segurança do Trabalho', 'Logística',
] as const;

export const SPECIALIZATION_AREAS = [
  'Gestão Escolar', 'Neuropsicopedagogia', 'Direito Digital',
  'Enfermagem em UTI', 'Engenharia de Software', 'Marketing Digital',
  'Psicologia Clínica', 'Auditoria e Perícia Contábil',
] as const;

export const MASTER_DEGREES = [
  'Educação', 'Administração', 'Saúde Coletiva',
  'Engenharia e Tecnologia', 'Direitos Humanos',
] as const;

export const STUDENT_PROFILES = [
  { id: 'fundamental', label: 'Ensino Fundamental', emoji: '👦', age: '1º ao 4º ano', detail: 'Anos iniciais com formação integral' },
  { id: 'medio', label: 'Ensino Médio', emoji: '👧', age: '5º ao 9º ano', detail: 'Anos finais — vestibular e ENEM' },
  { id: 'segundo-grau', label: 'Segundo Grau', emoji: '👦', emoji2: '👧', age: '2º Grau Escolar', detail: 'Ensino médio integral completo' },
  { id: 'graduacao', label: 'Graduação', emoji: '👨‍🎓', age: '18+ anos', detail: 'Bacharelado, licenciatura e tecnólogo' },
  { id: 'pos', label: 'Pós-Graduação', emoji: '👩‍💼', age: 'Graduados', detail: 'Especializações lato sensu' },
  { id: 'mestrado', label: 'Mestrado', emoji: '👨‍🔬', age: 'Graduados', detail: 'Pesquisa e inovação stricto sensu' },
] as const;

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro-nao-informar', label: 'Prefiro não informar' },
] as const;

export const SHIFT_OPTIONS = [
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
  { value: 'noturno', label: 'Noturno' },
  { value: 'integral', label: 'Integral' },
] as const;

export const HOW_FOUND_OPTIONS = [
  { value: 'google', label: 'Google / Internet' },
  { value: 'redes-sociais', label: 'Redes Sociais' },
  { value: 'indicacao', label: 'Indicação de amigo/familiar' },
  { value: 'panfleto', label: 'Panfleto / Outdoor' },
  { value: 'evento', label: 'Evento / Feira' },
  { value: 'outro', label: 'Outro' },
] as const;
