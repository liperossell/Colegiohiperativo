import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiRequestError } from '../services/api';
import { verifyAccountActivation } from '../services/enrollmentApi';
import Logo from '../components/Logo/Logo';
import './AuthPages.css';

type ActivationStatus = 'loading' | 'success' | 'invalid' | 'missing' | 'error';

/**
 * Página de confirmação de ativação de conta via link enviado por e-mail.
 */
export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ActivationStatus>('loading');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('missing');
      setMessage('Link de ativação inválido. Verifique se copiou o endereço completo do e-mail.');
      return undefined;
    }

    verifyAccountActivation(token)
      .then((data) => {
        setStatus('success');
        setUserName(data.user?.full_name ?? '');
        setMessage(
          data.alreadyActivated
            ? 'Sua conta já está ativada. Você pode fazer login normalmente.'
            : data.message || 'Conta ativada com sucesso.'
        );
      })
      .catch((error: unknown) => {
        if (error instanceof ApiRequestError && error.code === 'INVALID_ACTIVATION_TOKEN') {
          setStatus('invalid');
          setMessage(error.message);
          return;
        }

        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível ativar sua conta. Tente novamente mais tarde.'
        );
      });
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Logo variant="auth" asLink={false} showSlogan={false} className="auth-card__logo" />
          <h1 className="auth-card__title">Ativação de Conta</h1>
          <p className="auth-card__subtitle">
            {status === 'loading'
              ? 'Estamos confirmando seu cadastro...'
              : 'Confirmação de acesso ao portal do Hiperativo.'}
          </p>
        </div>

        {status === 'loading' && (
          <div className="activation-state activation-state--loading">
            <div className="activation-state__spinner" aria-hidden="true" />
            <p>Validando seu link de ativação...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="activation-state activation-state--success">
            <div className="activation-state__icon" aria-hidden="true">🎉</div>
            <h2 className="activation-state__title">Parabéns{userName ? `, ${userName}` : ''}!</h2>
            <p className="activation-state__message">{message}</p>
            <p className="activation-state__hint">
              Sua conta está pronta para uso. Agora você já pode acessar o portal.
            </p>
            <Link to="/login" className="btn btn--primary btn--lg activation-state__action">
              Ir para Login
            </Link>
          </div>
        )}

        {(status === 'invalid' || status === 'missing' || status === 'error') && (
          <div className="activation-state activation-state--error">
            <div className="activation-state__icon" aria-hidden="true">⚠️</div>
            <h2 className="activation-state__title">Não foi possível ativar</h2>
            <p className="activation-state__message">{message}</p>
            <div className="activation-state__actions">
              <Link to="/cadastro" className="btn btn--secondary btn--lg">
                Criar nova conta
              </Link>
              <Link to="/contato" className="btn btn--primary btn--lg">
                Falar com suporte
              </Link>
            </div>
          </div>
        )}

        <div className="auth-card__footer">
          <p>Precisa de ajuda? <Link to="/contato">Entre em contato</Link></p>
        </div>
      </div>
    </div>
  );
}
