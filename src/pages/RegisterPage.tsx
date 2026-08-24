import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { UserRegistration, INITIAL_REGISTRATION, FormErrors } from '../types';
import { formatCPF, formatPhone, validateEmail, validateCPF, validatePassword } from '../utils/validation';
import { submitRegistro } from '../services/enrollmentApi';
import Logo from '../components/Logo/Logo';
import './AuthPages.css';

const USER_TYPES = [
  { value: 'aluno', label: 'Aluno(a)', emoji: '🎓' },
  { value: 'responsavel', label: 'Responsável', emoji: '👨‍👩‍👧' },
  { value: 'professor', label: 'Professor(a)', emoji: '👨‍🏫' },
  { value: 'funcionario', label: 'Funcionário(a)', emoji: '💼' },
] as const;

export default function RegisterPage() {
  const [form, setForm] = useState<UserRegistration>(INITIAL_REGISTRATION);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [protocolo, setProtocolo] = useState('');
  const [submitError, setSubmitError] = useState('');

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  }

  function handleMasked(e: ChangeEvent<HTMLInputElement>, mask: 'cpf' | 'phone') {
    const formatters = { cpf: formatCPF, phone: formatPhone };
    setForm((prev) => ({ ...prev, [e.target.name]: formatters[mask](e.target.value) }));
  }

  function getPasswordStrength(): number {
    let strength = 0;
    if (form.password.length >= 8) strength++;
    if (/[A-Z]/.test(form.password)) strength++;
    if (/[a-z]/.test(form.password)) strength++;
    if (/[0-9]/.test(form.password)) strength++;
    if (/[^A-Za-z0-9]/.test(form.password)) strength++;
    return strength;
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
    if (!form.email) newErrors.email = 'E-mail é obrigatório';
    else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.phone) newErrors.phone = 'Telefone é obrigatório';
    if (!form.cpf) newErrors.cpf = 'CPF é obrigatório';
    else if (!validateCPF(form.cpf)) newErrors.cpf = 'CPF inválido';
    const pwCheck = validatePassword(form.password);
    if (!pwCheck.valid) newErrors.password = pwCheck.message;
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    if (!form.acceptTerms) newErrors.acceptTerms = 'Você deve aceitar os termos';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    submitRegistro(form)
      .then((result) => {
        setProtocolo(result.protocolo);
        setSuccess(true);
      })
      .catch((error: Error) => {
        setSubmitError(error.message || 'Erro ao criar conta. Tente novamente.');
      })
      .finally(() => setLoading(false));
  }

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__header">
          <Logo variant="auth" asLink={false} showSlogan={false} className="auth-card__logo" />
          <h1 className="auth-card__title">Criar Conta</h1>
          <p className="auth-card__subtitle">Cadastre-se para acessar o portal do Hiperativo.</p>
        </div>

        {success ? (
          <div>
            <div className="alert alert--success">
              Conta criada com sucesso! Verifique seu e-mail para ativar a conta.
            </div>
            {protocolo && (
              <p className="auth-card__protocol">
                Protocolo: <strong>{protocolo}</strong>
              </p>
            )}
            <Link to="/login" className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '1rem' }}>
              Ir para Login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tipo de Usuário</label>
              <div className="user-type-grid">
                {USER_TYPES.map((type) => (
                  <label key={type.value}
                    className={`user-type-option ${form.userType === type.value ? 'user-type-option--selected' : ''}`}>
                    <input type="radio" name="userType" value={type.value}
                      checked={form.userType === type.value} onChange={handleChange} />
                    <span className="user-type-option__emoji">{type.emoji}</span>
                    <span className="user-type-option__label">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label--required" htmlFor="fullName">Nome Completo</label>
              <input id="fullName" name="fullName" className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
                value={form.fullName} onChange={handleChange} placeholder="Seu nome completo" />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label--required" htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                  value={form.email} onChange={handleChange} placeholder="seu@email.com" />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label form-label--required" htmlFor="phone">Telefone</label>
                <input id="phone" name="phone" className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                  value={form.phone} onChange={(e) => handleMasked(e, 'phone')} placeholder="(00) 00000-0000" />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label--required" htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" className={`form-input ${errors.cpf ? 'form-input--error' : ''}`}
                value={form.cpf} onChange={(e) => handleMasked(e, 'cpf')} placeholder="000.000.000-00" maxLength={14} />
              {errors.cpf && <span className="form-error">{errors.cpf}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label--required" htmlFor="password">Senha</label>
                <input id="password" name="password" type="password" className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" />
                {form.password && (
                  <div className="password-strength">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`password-strength__bar ${
                        i <= strength ? (strength <= 2 ? 'password-strength__bar--weak' : strength <= 3 ? 'password-strength__bar--medium' : 'password-strength__bar--active') : ''
                      }`} />
                    ))}
                  </div>
                )}
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label form-label--required" htmlFor="confirmPassword">Confirmar Senha</label>
                <input id="confirmPassword" name="confirmPassword" type="password" className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                  value={form.confirmPassword} onChange={handleChange} placeholder="Repita a senha" />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="enrollment__checkbox-group">
              <input type="checkbox" id="acceptTerms" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
              <label className="enrollment__checkbox-label" htmlFor="acceptTerms">
                Li e aceito os Termos de Uso e a Política de Privacidade.
              </label>
            </div>
            {errors.acceptTerms && <span className="form-error">{errors.acceptTerms}</span>}

            {submitError && <div className="alert alert--error">{submitError}</div>}

            <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        )}

        <div className="auth-card__footer">
          <p>Já tem conta? <Link to="/login">Fazer login</Link></p>
        </div>
      </div>
    </div>
  );
}
