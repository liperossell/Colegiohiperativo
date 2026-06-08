import { Link } from 'react-router-dom';
import { SPORTS } from '../data/constants';
import './SportsPage.css';

export default function SportsPage() {
  return (
    <>
      <section className="page-hero sports-hero">
        <div className="container">
          <h1 className="page-hero__title">Esportes & Atividades</h1>
          <p className="page-hero__subtitle">
            7 modalidades esportivas para o desenvolvimento físico, social e emocional dos nossos alunos.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sports-grid">
            {SPORTS.map((sport) => (
              <div key={sport.id} className="sport-card card">
                <div className="sport-card__icon">{sport.emoji}</div>
                <h2 className="sport-card__title">{sport.name}</h2>
                <p className="sport-card__desc">{sport.description}</p>
                <ul className="sport-card__benefits">
                  <li>✅ Professores qualificados</li>
                  <li>✅ Equipamentos modernos</li>
                  <li>✅ Competições interclasse</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Complexo Esportivo</h2>
            <p className="section__subtitle">
              Infraestrutura completa para prática esportiva de excelência.
            </p>
          </div>
          <div className="grid grid--3">
            {[
              { emoji: '🏊', title: 'Piscina Olímpica', desc: '25m com 6 raias para natação' },
              { emoji: '🏟️', title: 'Ginásio Poliesportivo', desc: 'Vôlei, basquete e judô' },
              { emoji: '⚽', title: 'Campo Society', desc: 'Gramado sintético iluminado' },
              { emoji: '🥋', title: 'Dojo', desc: 'Tatame para karatê e judô' },
              { emoji: '🤸', title: 'Roda de Capoeira', desc: 'Espaço cultural ao ar livre' },
              { emoji: '🏋️', title: 'Academia', desc: 'Musculação e condicionamento' },
            ].map((facility) => (
              <div key={facility.title} className="card" style={{ textAlign: 'center' }}>
                <div className="card__body">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{facility.emoji}</div>
                  <h3 className="card__title">{facility.title}</h3>
                  <p className="card__text">{facility.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="cta__title">Inscreva-se nas atividades esportivas</h2>
          <p className="cta__text">
            Selecione suas modalidades favoritas durante a matrícula.
          </p>
          <Link to="/matricula" className="btn btn--secondary btn--lg">Fazer Matrícula</Link>
        </div>
      </section>
    </>
  );
}
