import { Link } from 'react-router-dom';
import {
  COURSE_LEVELS,
  GRADUATION_COURSES,
  TECHNICAL_COURSES,
  SPECIALIZATION_AREAS,
  MASTER_DEGREES,
} from '../data/constants';
import './CoursesPage.css';

export default function CoursesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Nossos Cursos</h1>
          <p className="page-hero__subtitle">
            Do Ensino Fundamental ao Mestrado — uma trajetória completa de formação.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="courses-levels">
            {COURSE_LEVELS.map((course) => (
              <div key={course.id} className="course-level-card card">
                <div className="course-level-card__header">
                  <span className="course-level-card__emoji">{course.emoji}</span>
                  <div>
                    <h2 className="course-level-card__title">{course.title}</h2>
                    <span className="badge badge--primary">{course.ageRange}</span>
                  </div>
                </div>
                <p className="course-level-card__desc">{course.description}</p>
                <div className="course-level-card__meta">
                  <span>⏱ Duração: {course.duration}</span>
                </div>
                <Link to="/matricula" className="btn btn--primary btn--sm">
                  Matricular-se
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🎓 Graduação</h2>
            <p className="section__subtitle">Bacharelado, Licenciatura e Tecnólogo</p>
          </div>
          <div className="course-tags">
            {GRADUATION_COURSES.map((course) => (
              <span key={course} className="course-tag">{course}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🔧 Cursos Técnicos</h2>
            <p className="section__subtitle">Formação profissionalizante integrada</p>
          </div>
          <div className="course-tags">
            {TECHNICAL_COURSES.map((course) => (
              <span key={course} className="course-tag course-tag--secondary">{course}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">📊 Especializações</h2>
            <p className="section__subtitle">Pós-graduação lato sensu</p>
          </div>
          <div className="course-tags">
            {SPECIALIZATION_AREAS.map((area) => (
              <span key={area} className="course-tag course-tag--success">{area}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🔬 Mestrado</h2>
            <p className="section__subtitle">Pós-graduação stricto sensu — Pesquisa e Inovação</p>
          </div>
          <div className="course-tags">
            {MASTER_DEGREES.map((degree) => (
              <span key={degree} className="course-tag course-tag--primary">{degree}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="cta__title">Encontre seu curso ideal</h2>
          <p className="cta__text">Faça sua matrícula online de forma rápida e segura.</p>
          <Link to="/matricula" className="btn btn--secondary btn--lg">Iniciar Matrícula</Link>
        </div>
      </section>
    </>
  );
}
