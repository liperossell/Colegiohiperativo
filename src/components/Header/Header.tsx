import { useState, useEffect } from 'react';

import { Link, NavLink } from 'react-router-dom';

import { NAV_LINKS } from '../../data/constants';

import { useScrollHeader } from '../../hooks/useScrollHeader';

import Logo from '../Logo/Logo';

import './Header.css';



export default function Header() {

  const [menuOpen, setMenuOpen] = useState(false);

  const scrolled = useScrollHeader();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${menuOpen ? 'header--menu-open' : ''}`}>

      <div className="container header__inner">

        <Logo variant="header" showSlogan className="header__logo" onClick={() => setMenuOpen(false)} />



        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>

          {NAV_LINKS.map((link) => (

            <NavLink

              key={link.path}

              to={link.path}

              className={({ isActive }) =>

                `header__link ${isActive ? 'header__link--active' : ''}`

              }

              onClick={() => setMenuOpen(false)}

            >

              {link.label}

            </NavLink>

          ))}

        </nav>



        <div className="header__actions">

          <Link to="/login" className="btn btn--ghost btn--sm">Entrar</Link>

          <Link to="/matricula" className="btn btn--primary btn--sm">Matricule-se</Link>

          <button

            className={`header__menu-btn ${menuOpen ? 'header__menu-btn--open' : ''}`}

            onClick={() => setMenuOpen(!menuOpen)}

            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}

          >

            <span />

            <span />

            <span />

          </button>

        </div>

      </div>

    </header>

  );

}


