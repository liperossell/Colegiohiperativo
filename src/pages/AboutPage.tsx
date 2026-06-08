import { BRAND } from '../data/constants';
import './AboutPage.css';

const VALUES = [
  { emoji: '🎯', title: 'Excelência', text: 'Compromisso com a qualidade em cada etapa da formação.' },
  { emoji: '🤝', title: 'Respeito', text: 'Valorização da diversidade e inclusão de todos os alunos.' },
  { emoji: '💡', title: 'Inovação', text: 'Metodologias modernas e tecnologia a serviço da educação.' },
  { emoji: '❤️', title: 'Cuidado', text: 'Atenção individualizada ao desenvolvimento de cada estudante.' },
  { emoji: '🌍', title: 'Cidadania', text: 'Formação de cidadãos conscientes e protagonistas.' },
  { emoji: '⚡', title: 'Energia', text: 'Ambiente dinâmico que estimula o aprendizado e a criatividade.' },
];

const TIMELINE = [
  { year: '1990', title: 'Fundação', text: 'Início como colégio com foco em educação integral.' },
  { year: '2005', title: 'Expansão', text: 'Inauguração da faculdade com primeiros cursos de graduação.' },
  { year: '2012', title: 'Centro Esportivo', text: 'Complexo esportivo com 7 modalidades para o público jovem.' },
  { year: '2018', title: 'Pós-Graduação', text: 'Lançamento de especializações e programas de mestrado.' },
  { year: '2024', title: 'Educação 4.0', text: 'Integração de tecnologia, IA e metodologias ativas em todos os níveis.' },
  { year: '2026', title: 'Portal Digital', text: 'Lançamento do portal completo para matrículas e gestão acadêmica.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <h1 className="about-hero__title">Sobre o {BRAND.name}</h1>
          <p className="about-hero__subtitle">{BRAND.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-content">
          <div className="about-content__text">
            <h3>Nossa História</h3>
            <p>
              O {BRAND.name} nasceu da visão de oferecer uma educação completa e transformadora.
              Desde 1990, formamos milhares de profissionais e cidadãos que fazem a diferença
              em suas comunidades e no mercado de trabalho.
            </p>
            <p>
              Nossa proposta de <strong>Educação Integral</strong> vai além das salas de aula,
              integrando atividades esportivas, culturais e tecnológicas para o desenvolvimento
              pleno de cada estudante — cognitivo, social, emocional e físico.
            </p>
            <p>
              Com infraestrutura moderna, corpo docente qualificado e metodologias ativas,
              somos referência em formação do Ensino Fundamental ao Mestrado.
            </p>
          </div>
          <div>
            <img
              src="/images/campus.svg"
              alt="Campus Colégio Faculdade Hiperativo"
              style={{ borderRadius: 'var(--radius-xl)', width: '100%' }}
            />
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Nossos Valores</h2>
            <p className="section__subtitle">Princípios que guiam nossa missão educacional.</p>
          </div>
          <div className="about-values">
            {VALUES.map((value) => (
              <div key={value.title} className="about-value">
                <span className="about-value__emoji">{value.emoji}</span>
                <div>
                  <div className="about-value__title">{value.title}</div>
                  <div className="about-value__text">{value.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Nossa Trajetória</h2>
          </div>
          <div className="timeline">
            {TIMELINE.map((item) => (
              <div key={item.year} className="timeline__item">
                <div className="timeline__year">{item.year}</div>
                <div className="timeline__title">{item.title}</div>
                <div className="timeline__text">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Nossa Comunidade</h2>
            <p className="section__subtitle">
              Alunos e alunas de todas as faixas etárias, unidos pela paixão por aprender.
            </p>
          </div>
          <div className="grid grid--3">
            {[
              { emoji: '👦👧', title: 'Ensino Fundamental & Médio', desc: 'Crianças e adolescentes em formação' },
              { emoji: '👨‍🔧👩‍🔧', title: 'Cursos Técnicos', desc: 'Jovens profissionalizando-se cedo' },
              { emoji: '👨‍🎓👩‍🎓', title: 'Graduação', desc: 'Universitários construindo o futuro' },
              { emoji: '👩‍💼👨‍💼', title: 'Especialização', desc: 'Profissionais aprofundando conhecimentos' },
              { emoji: '👨‍🔬👩‍🔬', title: 'Mestrado', desc: 'Pesquisadores e inovadores' },
              { emoji: '👨‍🏫👩‍🏫', title: 'Corpo Docente', desc: 'Educadores dedicados e qualificados' },
            ].map((group) => (
              <div key={group.title} className="card" style={{ textAlign: 'center' }}>
                <div className="card__body">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{group.emoji}</div>
                  <h3 className="card__title">{group.title}</h3>
                  <p className="card__text">{group.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
