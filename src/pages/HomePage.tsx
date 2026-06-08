import { Link } from 'react-router-dom';
import { BRAND, COURSE_LEVELS, SPORTS, STUDENT_PROFILES } from '../data/constants';
import './HomePage.css';

const STATS = [
  { number: '35+', label: 'Anos de Excelência' },
  { number: '12.000+', label: 'Alunos Formados' },
  { number: '50+', label: 'Cursos Disponíveis' },
  { number: '98%', label: 'Satisfação' },
];

const FEATURES = [
  {
    emoji: '🎯',
    title: 'Educação Integral',
    text: 'Formação completa nas dimensões cognitiva, social, emocional e física do estudante.',
  },
  {
    emoji: '💡',
    title: 'Metodologia Ativa',
    text: 'Aprendizado baseado em projetos, tecnologia e experiências práticas do mundo real.',
  },
  {
    emoji: '🏆',
    title: 'Excelência Acadêmica',
    text: 'Corpo docente qualificado e infraestrutura moderna para resultados de alto nível.',
  },
  {
    emoji: '⚽',
    title: 'Esportes & Cultura',
    text: '7 modalidades esportivas e atividades culturais para desenvolvimento integral.',
  },
  {
    emoji: '🌐',
    title: 'Do Colégio ao Mestrado',
    text: 'Trajetória educacional completa em uma única instituição de confiança.',
  },
  {
    emoji: '🤝',
    title: 'Acompanhamento Personalizado',
    text: 'Orientação pedagógica individualizada para cada fase da jornada acadêmica.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__content">
          <div className="hero__text animate-fade-in-up">
            <div className="hero__badge">
              {BRAND.emoji} Matrículas Abertas 2026
            </div>
            <h1 className="hero__title">
              {BRAND.shortName}: <span>Educação</span> que Transforma
            </h1>
            <p className="hero__subtitle">{BRAND.tagline}</p>
            <div className="hero__actions">
              <Link to="/matricula" className="btn btn--secondary btn--lg">
                Fazer Matrícula
              </Link>
              <Link to="/cursos" className="btn btn--outline btn--lg" style={{ color: '#fff', borderColor: '#fff' }}>
                Conheça os Cursos
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__students">
              {STUDENT_PROFILES.map((profile) => (
                <div key={profile.id} className="hero__student-card">
                  <div className={`hero__student-emoji${'emoji2' in profile && profile.emoji2 ? ' hero__student-emoji--duo' : ''}`}>
                    <span>{profile.emoji}</span>
                    {'emoji2' in profile && profile.emoji2 && <span>{profile.emoji2}</span>}
                  </div>
                  <div className="hero__student-body">
                    <div className="hero__student-label">{profile.label}</div>
                    <div className="hero__student-age">{profile.age}</div>
                    <div className="hero__student-detail">{profile.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats__grid">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="stats__number">{stat.number}</div>
              <div className="stats__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Por que escolher o Hiperativo?</h2>
            <p className="section__subtitle">
              Uma instituição completa que acompanha o aluno em todas as fases da vida acadêmica.
            </p>
          </div>
          <div className="features__grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card feature-card">
                <div className="feature-card__emoji">{feature.emoji}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Nossos Cursos</h2>
            <p className="section__subtitle">
              Do Ensino Fundamental ao Mestrado — encontre o caminho ideal para você.
            </p>
          </div>
          <div className="courses-preview__grid">
            {COURSE_LEVELS.map((course) => (
              <div key={course.id} className="card course-card">
                <div className="card__body">
                  <div className="course-card__emoji">{course.emoji}</div>
                  <h3 className="card__title">{course.title}</h3>
                  <p className="card__text">{course.description}</p>
                  <div className="course-card__age">{course.ageRange}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/cursos" className="btn btn--primary btn--lg">Ver Todos os Cursos</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Esportes & Atividades</h2>
            <p className="section__subtitle">
              Desenvolvimento físico e social através de modalidades esportivas de excelência.
            </p>
          </div>
          <div className="grid grid--4">
            {SPORTS.map((sport) => (
              <div key={sport.id} className="card" style={{ textAlign: 'center' }}>
                <div className="card__body">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{sport.emoji}</div>
                  <h3 className="card__title">{sport.name}</h3>
                  <p className="card__text">{sport.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/esportes" className="btn btn--secondary btn--lg">Conheça Nossos Esportes</Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2 className="cta__title">Pronto para fazer parte do Hiperativo?</h2>
          <p className="cta__text">
            Garanta a vaga do seu filho(a) ou inicie sua jornada acadêmica conosco.
            Matrículas abertas para todas as modalidades!
          </p>
          <Link to="/matricula" className="btn btn--secondary btn--lg">
            Iniciar Matrícula Agora
          </Link>
        </div>
      </section>
    </>
  );
}
