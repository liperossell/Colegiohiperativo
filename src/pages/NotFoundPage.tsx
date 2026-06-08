import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="section" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-gray-600)' }}>
          Página não encontrada
        </h2>
        <p style={{ color: 'var(--color-gray-500)', marginBottom: '2rem' }}>
          A página que você procura não existe ou foi movida.
        </p>
        <Link to="/" className="btn btn--primary btn--lg">Voltar ao Início</Link>
      </div>
    </section>
  );
}
