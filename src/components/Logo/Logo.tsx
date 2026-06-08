import { Link } from 'react-router-dom';
import { BRAND } from '../../data/constants';
import './Logo.css';

interface LogoProps {
  variant?: 'header' | 'footer' | 'compact';
  showSlogan?: boolean;
  asLink?: boolean;
  className?: string;
  onClick?: () => void;
}

function LogoSymbol() {
  return (
    <div className="logo__symbol" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="logoGradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a56db" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="accentGradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="85" fill="url(#logoGradHeader)" />
        <path
          d="M55 75 L100 60 L145 75 L145 130 L100 145 L55 130 Z"
          fill="white"
          opacity="0.95"
        />
        <path d="M100 60 L100 145" stroke="#1a56db" strokeWidth="2" />
        <path d="M65 85 L92 78 L92 120 L65 127 Z" fill="#e0e7ff" />
        <path d="M108 78 L135 85 L135 127 L108 120 Z" fill="#e0e7ff" />
        <path
          d="M100 45 L108 65 L130 68 L115 82 L118 105 L100 92 L82 105 L85 82 L70 68 L92 65 Z"
          fill="url(#accentGradHeader)"
        />
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fontFamily="Poppins, Arial, sans-serif"
          fontWeight="800"
          fontSize="28"
          fill="#1a56db"
        >
          H
        </text>
      </svg>
    </div>
  );
}

function LogoContent({ variant, showSlogan }: Pick<LogoProps, 'variant' | 'showSlogan'>) {
  return (
    <>
      <LogoSymbol />
      <div className="logo__text">
        <div className="logo__line">
          <span className="logo__prefix">Colégio</span>
          <span className="logo__brand">
            Hiper<span className="logo__brand-accent">ativo</span>
          </span>
        </div>
        {variant !== 'compact' && (
          <span className="logo__subtitle">{BRAND.logoSubtitle}</span>
        )}
        {showSlogan && variant === 'header' && (
          <span className="logo__slogan">{BRAND.slogan}</span>
        )}
      </div>
    </>
  );
}

export default function Logo({
  variant = 'header',
  showSlogan = true,
  asLink = true,
  className = '',
  onClick,
}: LogoProps) {
  const classes = `logo logo--${variant} ${className}`.trim();

  if (asLink) {
    return (
      <Link to="/" className={classes} aria-label={`${BRAND.logoTitle} — Página inicial`} onClick={onClick}>
        <LogoContent variant={variant} showSlogan={showSlogan} />
      </Link>
    );
  }

  return (
    <div className={classes} aria-label={BRAND.logoTitle}>
      <LogoContent variant={variant} showSlogan={showSlogan} />
    </div>
  );
}
