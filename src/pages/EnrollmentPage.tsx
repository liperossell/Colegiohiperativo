import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  COURSE_LEVELS,
  SPORTS,
  BRAZILIAN_STATES,
  GENDER_OPTIONS,
  SHIFT_OPTIONS,
  HOW_FOUND_OPTIONS,
  GRADUATION_COURSES,
  TECHNICAL_COURSES,
} from '../data/constants';
import {
  StudentEnrollment,
  INITIAL_ENROLLMENT,
  EnrollmentStep,
  FormErrors,
} from '../types';
import {
  formatCPF,
  formatPhone,
  formatCEP,
  validateEmail,
  validateCPF,
  calculateAge,
  fetchAddressByCEP,
} from '../utils/validation';
import { submitMatricula } from '../services/enrollmentApi';
import type { FormSubmissionResponse } from '../services/enrollmentApi';
import { getStoredUser } from '../utils/authSession';
import './EnrollmentPage.css';

const STEPS: { key: EnrollmentStep; label: string }[] = [
  { key: 'personal', label: 'Dados Pessoais' },
  { key: 'contact', label: 'Contato & Endereço' },
  { key: 'academic', label: 'Dados Acadêmicos' },
  { key: 'guardian', label: 'Responsável' },
  { key: 'additional', label: 'Complementar' },
  { key: 'review', label: 'Revisão' },
];

function getCourseOptions(level: string): string[] {
  switch (level) {
    case 'graduacao': return [...GRADUATION_COURSES];
    case 'tecnico': return [...TECHNICAL_COURSES];
    case 'fundamental': return ['Anos Iniciais (1º-5º)', 'Anos Finais (6º-9º)'];
    case 'medio': return ['Ensino Médio Regular', 'Ensino Médio Técnico Integrado'];
    case 'especializacao': return ['Gestão Escolar', 'Neuropsicopedagogia', 'Marketing Digital', 'Direito Digital'];
    case 'mestrado': return ['Educação', 'Administração', 'Saúde Coletiva', 'Engenharia e Tecnologia'];
    default: return [];
  }
}

export default function EnrollmentPage() {
  const [storedUser] = useState(() => getStoredUser());
  const [step, setStep] = useState<EnrollmentStep>('personal');
  const [form, setForm] = useState<StudentEnrollment>(INITIAL_ENROLLMENT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<FormSubmissionResponse | null>(null);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const hasLockedAccountFields = Boolean(storedUser);

  useEffect(() => {
    if (!storedUser) return;

    setForm((prev) => ({
      ...prev,
      fullName: storedUser.full_name,
      email: storedUser.email,
      phone: storedUser.phone ? formatPhone(storedUser.phone) : prev.phone,
      cpf: storedUser.cpf ? formatCPF(storedUser.cpf) : prev.cpf,
    }));
  }, [storedUser]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const isMinor = form.birthDate ? calculateAge(form.birthDate) < 18 : false;

  function updateField(field: string, value: string | boolean | string[]) {
    setForm((prev) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      const [parent, child] = keys;
      return {
        ...prev,
        [parent]: { ...(prev[parent as keyof StudentEnrollment] as object), [child]: value },
      };
    });
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  function handleMaskedInput(e: ChangeEvent<HTMLInputElement>, mask: 'cpf' | 'phone' | 'cep') {
    const formatters = { cpf: formatCPF, phone: formatPhone, cep: formatCEP };
    updateField(e.target.name, formatters[mask](e.target.value));
  }

  async function handleCEPBlur(cep: string) {
    if (cep.replace(/\D/g, '').length !== 8) return;
    setLoadingCEP(true);
    const address = await fetchAddressByCEP(cep);
    if (address) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, ...address },
      }));
    }
    setLoadingCEP(false);
  }

  function toggleSport(sportId: string) {
    const current = form.sportsInterests;
    const updated = current.includes(sportId)
      ? current.filter((s) => s !== sportId)
      : [...current, sportId];
    updateField('sportsInterests', updated);
  }

  function validateStep(): boolean {
    const newErrors: FormErrors = {};

    switch (step) {
      case 'personal':
        if (!form.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
        if (!form.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
        if (!form.gender) newErrors.gender = 'Selecione o gênero';
        if (!form.cpf) newErrors.cpf = 'CPF é obrigatório';
        else if (!validateCPF(form.cpf)) newErrors.cpf = 'CPF inválido';
        break;

      case 'contact':
        if (!form.email) newErrors.email = 'E-mail é obrigatório';
        else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
        if (!form.phone) newErrors.phone = 'Telefone é obrigatório';
        if (!form.address.cep) newErrors['address.cep'] = 'CEP é obrigatório';
        if (!form.address.street) newErrors['address.street'] = 'Rua é obrigatória';
        if (!form.address.number) newErrors['address.number'] = 'Número é obrigatório';
        if (!form.address.neighborhood) newErrors['address.neighborhood'] = 'Bairro é obrigatório';
        if (!form.address.city) newErrors['address.city'] = 'Cidade é obrigatória';
        if (!form.address.state) newErrors['address.state'] = 'Estado é obrigatório';
        break;

      case 'academic':
        if (!form.courseLevel) newErrors.courseLevel = 'Selecione o nível do curso';
        if (!form.courseName) newErrors.courseName = 'Selecione o curso';
        if (!form.shift) newErrors.shift = 'Selecione o turno';
        break;

      case 'guardian':
        if (isMinor) {
          if (!form.guardian.name) newErrors['guardian.name'] = 'Nome do responsável é obrigatório';
          if (!form.guardian.cpf) newErrors['guardian.cpf'] = 'CPF do responsável é obrigatório';
          if (!form.guardian.phone) newErrors['guardian.phone'] = 'Telefone do responsável é obrigatório';
          if (!form.guardian.email) newErrors['guardian.email'] = 'E-mail do responsável é obrigatório';
          if (!form.guardian.relationship) newErrors['guardian.relationship'] = 'Parentesco é obrigatório';
        }
        break;

      case 'review':
        if (!form.acceptTerms) newErrors.acceptTerms = 'Você deve aceitar os termos';
        if (!form.acceptPrivacy) newErrors.acceptPrivacy = 'Você deve aceitar a política de privacidade';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (!validateStep()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      if (STEPS[nextIndex].key === 'guardian' && !isMinor) {
        setStep(STEPS[nextIndex + 1]?.key || 'review');
      } else {
        setStep(STEPS[nextIndex].key);
      }
    }
  }

  function prevStep() {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      if (STEPS[prevIndex].key === 'guardian' && !isMinor) {
        setStep(STEPS[prevIndex - 1]?.key || 'academic');
      } else {
        setStep(STEPS[prevIndex].key);
      }
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    setSubmitError('');

    submitMatricula(form)
      .then((result) => {
        setSubmissionResult(result);
        setSubmitted(true);
      })
      .catch((error: Error) => {
        setSubmitError(error.message || 'Erro ao enviar matrícula. Tente novamente.');
      })
      .finally(() => setSubmitting(false));
  }

  if (submitted) {
    return (
      <section className="enrollment">
        <div className="container">
          <div className="enrollment__form enrollment__success">
            <div className="enrollment__success-emoji">🎉</div>
            <h2 className="enrollment__title">Matrícula Enviada com Sucesso!</h2>
            <p className="enrollment__subtitle">
              Recebemos sua solicitação de matrícula para <strong>{form.fullName}</strong>.
              Enviaremos a confirmação para <strong>{form.email}</strong> em até 48 horas.
            </p>
            {submissionResult?.protocolo && (
              <p className="enrollment__protocol">
                Protocolo: <strong>{submissionResult.protocolo}</strong>
              </p>
            )}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn--primary">Voltar ao Início</Link>
              <Link to="/cadastro" className="btn btn--outline">Criar Conta de Acesso</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="enrollment">
      <div className="container">
        <div className="enrollment__header">
          <h1 className="enrollment__title">Formulário de Matrícula</h1>
          <p className="enrollment__subtitle">
            Preencha todos os dados para solicitar a matrícula no Colégio Faculdade Hiperativo.
          </p>
          {hasLockedAccountFields && (
            <p className="enrollment__account-hint">
              Nome, CPF, e-mail e telefone foram preenchidos da sua conta e não podem ser alterados aqui.
            </p>
          )}
        </div>

        <div className="enrollment__steps">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`enrollment__step ${
                s.key === step ? 'enrollment__step--active' : i < currentStepIndex ? 'enrollment__step--done' : ''
              }`}
            >
              <span className="enrollment__step-number">{i < currentStepIndex ? '✓' : i + 1}</span>
              {s.label}
            </div>
          ))}
        </div>

        <form className="enrollment__form" onSubmit={handleSubmit}>
          {step === 'personal' && (
            <div className="form-section">
              <h3 className="form-section__title">👤 Dados Pessoais do Aluno(a)</h3>
              <div className="enrollment__form-grid">
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label form-label--required" htmlFor="fullName">Nome Completo</label>
                  <input id="fullName" name="fullName" className={`form-input ${errors.fullName ? 'form-input--error' : ''} ${hasLockedAccountFields ? 'form-input--locked' : ''}`}
                    value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Nome completo do aluno(a)"
                    readOnly={hasLockedAccountFields} />
                  {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="socialName">Nome Social</label>
                  <input id="socialName" name="socialName" className="form-input"
                    value={form.socialName} onChange={(e) => updateField('socialName', e.target.value)} placeholder="Se aplicável" />
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="birthDate">Data de Nascimento</label>
                  <input id="birthDate" name="birthDate" type="date" className={`form-input ${errors.birthDate ? 'form-input--error' : ''}`}
                    value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} />
                  {errors.birthDate && <span className="form-error">{errors.birthDate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="gender">Gênero</label>
                  <select id="gender" name="gender" className={`form-select ${errors.gender ? 'form-select--error' : ''}`}
                    value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                    <option value="">Selecione</option>
                    {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                  {errors.gender && <span className="form-error">{errors.gender}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="cpf">CPF</label>
                  <input id="cpf" name="cpf" className={`form-input ${errors.cpf ? 'form-input--error' : ''} ${hasLockedAccountFields ? 'form-input--locked' : ''}`}
                    value={form.cpf} onChange={(e) => handleMaskedInput(e, 'cpf')} placeholder="000.000.000-00" maxLength={14}
                    readOnly={hasLockedAccountFields} />
                  {errors.cpf && <span className="form-error">{errors.cpf}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rg">RG</label>
                  <input id="rg" name="rg" className="form-input"
                    value={form.rg} onChange={(e) => updateField('rg', e.target.value)} placeholder="Número do RG" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="nationality">Nacionalidade</label>
                  <input id="nationality" name="nationality" className="form-input"
                    value={form.nationality} onChange={(e) => updateField('nationality', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="birthPlace">Naturalidade</label>
                  <input id="birthPlace" name="birthPlace" className="form-input"
                    value={form.birthPlace} onChange={(e) => updateField('birthPlace', e.target.value)} placeholder="Cidade/Estado de nascimento" />
                </div>
              </div>
            </div>
          )}

          {step === 'contact' && (
            <div className="form-section">
              <h3 className="form-section__title">📧 Contato & Endereço</h3>
              <div className="enrollment__form-grid">
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="email">E-mail</label>
                  <input id="email" name="email" type="email" className={`form-input ${errors.email ? 'form-input--error' : ''} ${hasLockedAccountFields ? 'form-input--locked' : ''}`}
                    value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@exemplo.com"
                    readOnly={hasLockedAccountFields} />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="phone">Telefone</label>
                  <input id="phone" name="phone" className={`form-input ${errors.phone ? 'form-input--error' : ''} ${hasLockedAccountFields ? 'form-input--locked' : ''}`}
                    value={form.phone} onChange={(e) => handleMaskedInput(e, 'phone')} placeholder="(00) 00000-0000"
                    readOnly={hasLockedAccountFields} />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label" htmlFor="whatsapp">WhatsApp</label>
                  <input id="whatsapp" name="whatsapp" className="form-input"
                    value={form.whatsapp} onChange={(e) => handleMaskedInput(e, 'phone')} placeholder="(00) 00000-0000" />
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="address.cep">CEP</label>
                  <input id="address.cep" name="address.cep" className={`form-input ${errors['address.cep'] ? 'form-input--error' : ''}`}
                    value={form.address.cep} onChange={(e) => handleMaskedInput(e, 'cep')}
                    onBlur={() => handleCEPBlur(form.address.cep)} placeholder="00000-000" maxLength={9} />
                  {loadingCEP && <span className="form-hint">Buscando endereço...</span>}
                  {errors['address.cep'] && <span className="form-error">{errors['address.cep']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="address.street">Rua / Logradouro</label>
                  <input id="address.street" name="address.street" className={`form-input ${errors['address.street'] ? 'form-input--error' : ''}`}
                    value={form.address.street} onChange={(e) => updateField('address.street', e.target.value)} />
                  {errors['address.street'] && <span className="form-error">{errors['address.street']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="address.number">Número</label>
                  <input id="address.number" name="address.number" className={`form-input ${errors['address.number'] ? 'form-input--error' : ''}`}
                    value={form.address.number} onChange={(e) => updateField('address.number', e.target.value)} />
                  {errors['address.number'] && <span className="form-error">{errors['address.number']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="address.complement">Complemento</label>
                  <input id="address.complement" name="address.complement" className="form-input"
                    value={form.address.complement} onChange={(e) => updateField('address.complement', e.target.value)} placeholder="Apto, bloco, etc." />
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="address.neighborhood">Bairro</label>
                  <input id="address.neighborhood" name="address.neighborhood" className={`form-input ${errors['address.neighborhood'] ? 'form-input--error' : ''}`}
                    value={form.address.neighborhood} onChange={(e) => updateField('address.neighborhood', e.target.value)} />
                  {errors['address.neighborhood'] && <span className="form-error">{errors['address.neighborhood']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="address.city">Cidade</label>
                  <input id="address.city" name="address.city" className={`form-input ${errors['address.city'] ? 'form-input--error' : ''}`}
                    value={form.address.city} onChange={(e) => updateField('address.city', e.target.value)} />
                  {errors['address.city'] && <span className="form-error">{errors['address.city']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="address.state">Estado</label>
                  <select id="address.state" name="address.state" className={`form-select ${errors['address.state'] ? 'form-select--error' : ''}`}
                    value={form.address.state} onChange={(e) => updateField('address.state', e.target.value)}>
                    <option value="">UF</option>
                    {BRAZILIAN_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                  {errors['address.state'] && <span className="form-error">{errors['address.state']}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 'academic' && (
            <div className="form-section">
              <h3 className="form-section__title">🎓 Dados Acadêmicos</h3>
              <div className="enrollment__form-grid">
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="courseLevel">Nível do Curso</label>
                  <select id="courseLevel" name="courseLevel" className={`form-select ${errors.courseLevel ? 'form-select--error' : ''}`}
                    value={form.courseLevel} onChange={(e) => { updateField('courseLevel', e.target.value); updateField('courseName', ''); }}>
                    <option value="">Selecione o nível</option>
                    {COURSE_LEVELS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
                  </select>
                  {errors.courseLevel && <span className="form-error">{errors.courseLevel}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="courseName">Curso / Série</label>
                  <select id="courseName" name="courseName" className={`form-select ${errors.courseName ? 'form-select--error' : ''}`}
                    value={form.courseName} onChange={(e) => updateField('courseName', e.target.value)} disabled={!form.courseLevel}>
                    <option value="">Selecione o curso</option>
                    {getCourseOptions(form.courseLevel).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.courseName && <span className="form-error">{errors.courseName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="shift">Turno</label>
                  <select id="shift" name="shift" className={`form-select ${errors.shift ? 'form-select--error' : ''}`}
                    value={form.shift} onChange={(e) => updateField('shift', e.target.value)}>
                    <option value="">Selecione o turno</option>
                    {SHIFT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  {errors.shift && <span className="form-error">{errors.shift}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="previousSchool">Escola Anterior</label>
                  <input id="previousSchool" name="previousSchool" className="form-input"
                    value={form.previousSchool} onChange={(e) => updateField('previousSchool', e.target.value)} placeholder="Nome da instituição anterior" />
                </div>
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label" htmlFor="yearOfCompletion">Ano de Conclusão Anterior</label>
                  <input id="yearOfCompletion" name="yearOfCompletion" className="form-input"
                    value={form.yearOfCompletion} onChange={(e) => updateField('yearOfCompletion', e.target.value)} placeholder="Ex: 2025" />
                </div>
              </div>
            </div>
          )}

          {step === 'guardian' && isMinor && (
            <div className="form-section">
              <h3 className="form-section__title">👨‍👩‍👧 Dados do Responsável</h3>
              <p className="form-hint" style={{ marginBottom: '1.5rem' }}>
                Como o aluno(a) é menor de 18 anos, precisamos dos dados do responsável legal.
              </p>
              <div className="enrollment__form-grid">
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label form-label--required" htmlFor="guardian.name">Nome Completo do Responsável</label>
                  <input id="guardian.name" name="guardian.name" className={`form-input ${errors['guardian.name'] ? 'form-input--error' : ''}`}
                    value={form.guardian.name} onChange={(e) => updateField('guardian.name', e.target.value)} />
                  {errors['guardian.name'] && <span className="form-error">{errors['guardian.name']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="guardian.cpf">CPF do Responsável</label>
                  <input id="guardian.cpf" name="guardian.cpf" className={`form-input ${errors['guardian.cpf'] ? 'form-input--error' : ''}`}
                    value={form.guardian.cpf} onChange={(e) => updateField('guardian.cpf', formatCPF(e.target.value))} maxLength={14} />
                  {errors['guardian.cpf'] && <span className="form-error">{errors['guardian.cpf']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="guardian.relationship">Parentesco</label>
                  <select id="guardian.relationship" name="guardian.relationship" className={`form-select ${errors['guardian.relationship'] ? 'form-select--error' : ''}`}
                    value={form.guardian.relationship} onChange={(e) => updateField('guardian.relationship', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="pai">Pai</option>
                    <option value="mae">Mãe</option>
                    <option value="avo">Avô/Avó</option>
                    <option value="tio">Tio/Tia</option>
                    <option value="tutor">Tutor Legal</option>
                    <option value="outro">Outro</option>
                  </select>
                  {errors['guardian.relationship'] && <span className="form-error">{errors['guardian.relationship']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="guardian.phone">Telefone do Responsável</label>
                  <input id="guardian.phone" name="guardian.phone" className={`form-input ${errors['guardian.phone'] ? 'form-input--error' : ''}`}
                    value={form.guardian.phone} onChange={(e) => updateField('guardian.phone', formatPhone(e.target.value))} />
                  {errors['guardian.phone'] && <span className="form-error">{errors['guardian.phone']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label form-label--required" htmlFor="guardian.email">E-mail do Responsável</label>
                  <input id="guardian.email" name="guardian.email" type="email" className={`form-input ${errors['guardian.email'] ? 'form-input--error' : ''}`}
                    value={form.guardian.email} onChange={(e) => updateField('guardian.email', e.target.value)} />
                  {errors['guardian.email'] && <span className="form-error">{errors['guardian.email']}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 'additional' && (
            <div className="form-section">
              <h3 className="form-section__title">⚽ Esportes & Informações Complementares</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Modalidades Esportivas de Interesse</label>
                <div className="enrollment__sports-grid">
                  {SPORTS.map((sport) => (
                    <label key={sport.id}
                      className={`enrollment__sport-option ${form.sportsInterests.includes(sport.id) ? 'enrollment__sport-option--selected' : ''}`}>
                      <input type="checkbox" checked={form.sportsInterests.includes(sport.id)} onChange={() => toggleSport(sport.id)} />
                      <span className="enrollment__sport-emoji">{sport.emoji}</span>
                      <span className="enrollment__sport-name">{sport.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="enrollment__form-grid">
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label" htmlFor="specialNeeds">Necessidades Especiais</label>
                  <textarea id="specialNeeds" name="specialNeeds" className="form-textarea" rows={3}
                    value={form.specialNeeds} onChange={(e) => updateField('specialNeeds', e.target.value)}
                    placeholder="Descreva se o aluno possui necessidades especiais ou laudo médico" />
                </div>
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label" htmlFor="medicalInfo">Informações Médicas</label>
                  <textarea id="medicalInfo" name="medicalInfo" className="form-textarea" rows={3}
                    value={form.medicalInfo} onChange={(e) => updateField('medicalInfo', e.target.value)}
                    placeholder="Alergias, medicamentos, restrições alimentares, etc." />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="howFoundUs">Como nos conheceu?</label>
                  <select id="howFoundUs" name="howFoundUs" className="form-select"
                    value={form.howFoundUs} onChange={(e) => updateField('howFoundUs', e.target.value)}>
                    <option value="">Selecione</option>
                    {HOW_FOUND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group enrollment__form-grid--full">
                  <label className="form-label" htmlFor="observations">Observações</label>
                  <textarea id="observations" name="observations" className="form-textarea" rows={3}
                    value={form.observations} onChange={(e) => updateField('observations', e.target.value)}
                    placeholder="Informações adicionais que deseja compartilhar" />
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="form-section">
              <h3 className="form-section__title">📋 Revisão dos Dados</h3>
              <div className="enrollment__review">
                <div className="enrollment__review-section">
                  <h4>Dados Pessoais</h4>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">Nome</span><span className="enrollment__review-value">{form.fullName}</span></div>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">CPF</span><span className="enrollment__review-value">{form.cpf}</span></div>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">Nascimento</span><span className="enrollment__review-value">{form.birthDate}</span></div>
                </div>
                <div className="enrollment__review-section">
                  <h4>Contato</h4>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">E-mail</span><span className="enrollment__review-value">{form.email}</span></div>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">Telefone</span><span className="enrollment__review-value">{form.phone}</span></div>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">Endereço</span><span className="enrollment__review-value">{form.address.street}, {form.address.number} — {form.address.city}/{form.address.state}</span></div>
                </div>
                <div className="enrollment__review-section">
                  <h4>Acadêmico</h4>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">Curso</span><span className="enrollment__review-value">{form.courseName}</span></div>
                  <div className="enrollment__review-item"><span className="enrollment__review-label">Turno</span><span className="enrollment__review-value">{form.shift}</span></div>
                  {form.sportsInterests.length > 0 && (
                    <div className="enrollment__review-item"><span className="enrollment__review-label">Esportes</span><span className="enrollment__review-value">{form.sportsInterests.map(id => SPORTS.find(s => s.id === id)?.name).join(', ')}</span></div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div className="enrollment__checkbox-group">
                  <input type="checkbox" id="acceptTerms" checked={form.acceptTerms} onChange={(e) => updateField('acceptTerms', e.target.checked)} />
                  <label className="enrollment__checkbox-label" htmlFor="acceptTerms">
                    Li e aceito os Termos de Matrícula e o Regimento Interno da instituição.
                  </label>
                </div>
                {errors.acceptTerms && <span className="form-error">{errors.acceptTerms}</span>}

                <div className="enrollment__checkbox-group">
                  <input type="checkbox" id="acceptPrivacy" checked={form.acceptPrivacy} onChange={(e) => updateField('acceptPrivacy', e.target.checked)} />
                  <label className="enrollment__checkbox-label" htmlFor="acceptPrivacy">
                    Concordo com a Política de Privacidade e o tratamento dos meus dados pessoais (LGPD).
                  </label>
                </div>
                {errors.acceptPrivacy && <span className="form-error">{errors.acceptPrivacy}</span>}

                <div className="enrollment__checkbox-group">
                  <input type="checkbox" id="acceptMarketing" checked={form.acceptMarketing} onChange={(e) => updateField('acceptMarketing', e.target.checked)} />
                  <label className="enrollment__checkbox-label" htmlFor="acceptMarketing">
                    Desejo receber informações sobre eventos, cursos e novidades por e-mail e WhatsApp.
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="enrollment__actions">
            {submitError && (
              <div className="alert alert--error" style={{ marginBottom: '1rem' }}>
                {submitError}
              </div>
            )}
            {currentStepIndex > 0 ? (
              <button type="button" className="btn btn--ghost" onClick={prevStep}>← Voltar</button>
            ) : <div />}
            {step === 'review' ? (
              <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
                {submitting ? 'Enviando...' : '✅ Confirmar Matrícula'}
              </button>
            ) : (
              <button type="button" className="btn btn--primary btn--lg" onClick={nextStep}>Próximo →</button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
