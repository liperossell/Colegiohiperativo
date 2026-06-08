import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { UserLogin, INITIAL_LOGIN, FormErrors } from '../types';
import { validateEmail } from '../utils/validation';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState<UserLogin>(INITIAL_LOGIN);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.email) newErrors.email = 'E-mail é obrigatório';
    else if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.password) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      console.log('Login:', form);
    }, 1500);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <img src="/images/logo.svg" alt="Logo Hiperativo" className="auth-card__logo" />
          <h1 className="auth-card__title">Área do Aluno</h1>
          <p className="auth-card__subtitle">Acesse sua conta para acompanhar sua jornada acadêmica.</p>
        </div>

        {success ? (
          <div className="alert alert--success">
            Login realizado com sucesso! (Demonstração — backend será integrado futuramente.)
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label form-label--required" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                value={form.email} onChange={handleChange} placeholder="seu@email.com" autoComplete="email" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label--required" htmlFor="password">Senha</label>
              <input id="password" name="password" type="password" className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                value={form.password} onChange={handleChange} placeholder="Sua senha" autoComplete="current-password" />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="auth-form__options">
              <label className="auth-form__remember">
                <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
                Lembrar-me
              </label>
              <a href="#" className="auth-form__forgot">Esqueci a senha</a>
            </div>

            <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        <div className="auth-form__divider">ou</div>

        <div className="auth-card__footer">
          <p>Não tem conta? <Link to="/cadastro">Criar conta</Link></p>
          <p style={{ marginTop: '0.5rem' }}>Ainda não é aluno? <Link to="/matricula">Fazer matrícula</Link></p>
        </div>
      </div>
    </div>
  );
}
