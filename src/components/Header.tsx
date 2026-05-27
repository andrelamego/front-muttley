import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import db from '../data/mockDb';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const loggedUser = db.getLoggedUser();
  const isAdmin = path.startsWith('/admin');

  const handleLogout = () => {
    db.setLoggedUser(null);
    navigate('/login');
  };

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

      <Link className="brand" to={isAdmin ? "/admin/inicio" : loggedUser ? "/user/inicio" : "/login"}>
        Muttley
      </Link>

      {!isAdmin && loggedUser?.role === 'ADMIN' && (
        <nav className="main-nav" aria-label="Navegação principal">
          <Link to="/admin/inicio">
            Painel Admin
          </Link>
        </nav>
      )}

      {/* Navigation for USER role on Desktop/Tablet (hidden on Mobile via CSS) */}
      {!isAdmin && loggedUser?.role === 'USER' && (
        <nav className="main-nav user-desktop-nav" aria-label="Navegação principal do usuário">
          <Link to="/user/inicio" className={path === '/user/inicio' ? 'active' : ''}>
            Início
          </Link>
          <Link to="/user/certificados" className={path.startsWith('/user/certificados') ? 'active' : ''}>
            Certificados
          </Link>
          <Link to="/user/medalhas" className={path.startsWith('/user/medalhas') ? 'active' : ''}>
            Medalhas
          </Link>
        </nav>
      )}

      <div className="user-menu" aria-label="Usuário logado">
        {loggedUser ? (
          <>
            <span className="user-display-name text-xs md:text-sm font-semibold">{loggedUser.nome.split(' ')[0]}</span>
            <span className="avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6"></path>
              </svg>
            </span>
            <button
              onClick={handleLogout}
              className="text-[10px] md:text-xs font-bold text-brand-danger bg-brand-danger-soft px-2.5 py-1 rounded-full hover:bg-brand-danger hover:text-white transition-colors cursor-pointer ml-1"
              type="button"
            >
              Sair
            </button>
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

