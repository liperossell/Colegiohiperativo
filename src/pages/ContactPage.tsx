import { useState, FormEvent, ChangeEvent } from 'react';
import { BRAND } from '../data/constants';
import { validateEmail } from '../utils/validation';
import { formatPhone } from '../utils/validation';
import './ContactPage.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email || !validateEmail(form.email)) newErrors.email = 'E-mail válido é obrigatório';
    if (!form.message.trim()) newErrors.message = 'Mensagem é obrigatória';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log('Contato:', form);
      setSent(true);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Fale Conosco</h1>
          <p className="page-hero__subtitle">Estamos prontos para ajudar você e sua família.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2>Informações de Contato</h2>
            <div className="contact-info__item">
              <span className="contact-info__icon">📞</span>
              <div>
                <strong>Telefone</strong>
                <p>{BRAND.contact.phone}</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">💬</span>
              <div>
                <strong>WhatsApp</strong>
                <p>{BRAND.contact.whatsapp}</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">✉️</span>
              <div>
                <strong>E-mail</strong>
                <p>{BRAND.contact.email}</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">📍</span>
              <div>
                <strong>Endereço</strong>
                <p>{BRAND.contact.address}</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">🕐</span>
              <div>
                <strong>Horário de Atendimento</strong>
                <p>Segunda a Sexta: 7h às 19h</p>
                <p>Sábado: 8h às 12h</p>
              </div>
            </div>
          </div>

          <div className="contact-form card">
            <div className="card__body">
              {sent ? (
                <div className="alert alert--success">
                  Mensagem enviada com sucesso! Retornaremos em breve.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                  <h3 style={{ marginBottom: '0.5rem' }}>Envie sua mensagem</h3>
                  <div className="form-group">
                    <label className="form-label form-label--required" htmlFor="name">Nome</label>
                    <input id="name" name="name" className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                      value={form.name} onChange={handleChange} />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label form-label--required" htmlFor="email">E-mail</label>
                      <input id="email" name="email" type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                        value={form.email} onChange={handleChange} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Telefone</label>
                      <input id="phone" name="phone" className="form-input"
                        value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="subject">Assunto</label>
                    <select id="subject" name="subject" className="form-select" value={form.subject} onChange={handleChange}>
                      <option value="">Selecione</option>
                      <option value="matricula">Matrícula</option>
                      <option value="cursos">Informações sobre Cursos</option>
                      <option value="esportes">Atividades Esportivas</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label--required" htmlFor="message">Mensagem</label>
                    <textarea id="message" name="message" className={`form-textarea ${errors.message ? 'form-input--error' : ''}`}
                      rows={5} value={form.message} onChange={handleChange} />
                    {errors.message && <span className="form-error">{errors.message}</span>}
                  </div>
                  <button type="submit" className="btn btn--primary btn--lg">Enviar Mensagem</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
