import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import db from '../data/mockDb';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const path = location.pathname;
  const loggedUser = db.getLoggedUser();
  const isAdmin = path.startsWith('/admin');

  return (
    <header className="app-header">
      {isAdmin && (
        <button
          className="topbar-hamburger"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Abrir navegação"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}

      <Link className="brand" to={isAdmin ? "/admin/inicio" : "/login"}>
        Muttley
      </Link>

      {!isAdmin && loggedUser?.role === 'ADMIN' && (
        <nav className="main-nav" aria-label="Navegação principal">
          <Link to="/admin/inicio">
            Painel Admin
          </Link>
        </nav>
      )}

      <div className="user-menu" aria-label="Usuário logado">
        {loggedUser ? (
          <>
            <span>{loggedUser.nome.split(' ')[0]}</span>
            <span className="avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6"></path>
              </svg>
            </span>
          </>
        ) : (
          <Link to="/login" className="table-action font-semibold">
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
