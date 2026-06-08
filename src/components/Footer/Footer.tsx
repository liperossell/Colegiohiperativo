import { Link } from 'react-router-dom';
import { BRAND, NAV_LINKS, COURSE_LEVELS, SPORTS } from '../../data/constants';
import Logo from '../Logo/Logo';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo variant="footer" showSlogan={false} className="footer__logo" />
            <p className="footer__brand-slogan">{BRAND.emoji} {BRAND.slogan}</p>
            <p className="footer__brand-desc">{BRAND.description}</p>
          </div>

          <div>
            <h4 className="footer__title">Navegação</h4>
            <div className="footer__links">
              {NAV_LINKS.map((link) => (
                <Link key={link.path} to={link.path} className="footer__link">
                  {link.label}
                </Link>
              ))}
              <Link to="/login" className="footer__link">Área do Aluno</Link>
              <Link to="/cadastro" className="footer__link">Criar Conta</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Cursos</h4>
            <div className="footer__links">
              {COURSE_LEVELS.map((course) => (
                <Link key={course.id} to="/cursos" className="footer__link">
                  {course.emoji} {course.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer__title">Contato</h4>
            <div className="footer__contact-item">
              <span>📞</span>
              <span>{BRAND.contact.phone}</span>
            </div>
            <div className="footer__contact-item">
              <span>💬</span>
              <span>{BRAND.contact.whatsapp}</span>
            </div>
            <div className="footer__contact-item">
              <span>✉️</span>
              <span>{BRAND.contact.email}</span>
            </div>
            <div className="footer__contact-item">
              <span>📍</span>
              <span>{BRAND.contact.address}</span>
            </div>

            <h4 className="footer__title footer__title--spaced">Esportes</h4>
            <div className="footer__links">
              {SPORTS.slice(0, 4).map((sport) => (
                <Link key={sport.id} to="/esportes" className="footer__link">
                  {sport.emoji} {sport.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} {BRAND.name}. Todos os direitos reservados.</p>
          <div className="footer__social">
            <a href="#" className="footer__social-link" aria-label="Instagram">📸</a>
            <a href="#" className="footer__social-link" aria-label="Facebook">📘</a>
            <a href="#" className="footer__social-link" aria-label="YouTube">▶️</a>
            <a href="#" className="footer__social-link" aria-label="WhatsApp">💬</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
