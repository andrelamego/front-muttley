import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Menu, ShieldCheck, UserRound } from 'lucide-react'
import db from '../data/mockDb'
import { ButtonLink } from './ui'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const loggedUser = db.getLoggedUser()
  const isAdmin = path.startsWith('/admin')

  const handleLogout = () => {
    db.setLoggedUser(null)
    navigate('/login')
  }

  return (
    <header className="app-header app-header--redesign">
      <div className="app-header__left">
        {isAdmin && (
          <button className="topbar-hamburger" type="button" onClick={onToggleSidebar} aria-label="Abrir navegacao">
            <Menu aria-hidden="true" />
          </button>
        )}

        <Link className="brand" to={isAdmin ? '/admin/inicio' : loggedUser ? '/user/inicio' : '/login'}>
          Muttley
        </Link>
      </div>

      {!isAdmin && loggedUser?.role === 'ADMIN' && (
        <nav className="main-nav" aria-label="Navegacao principal">
          <Link to="/admin/inicio">
            <ShieldCheck aria-hidden="true" />
            Painel admin
          </Link>
        </nav>
      )}

      {!isAdmin && loggedUser?.role === 'USER' && (
        <nav className="main-nav user-desktop-nav" aria-label="Navegacao principal do usuario">
          <Link to="/user/inicio" className={path === '/user/inicio' ? 'active' : ''}>
            Inicio
          </Link>
          <Link to="/user/certificados" className={path.startsWith('/user/certificados') ? 'active' : ''}>
            Certificados
          </Link>
          <Link to="/user/medalhas" className={path.startsWith('/user/medalhas') ? 'active' : ''}>
            Medalhas
          </Link>
        </nav>
      )}

      <div className="user-menu" aria-label="Usuario logado">
        {loggedUser ? (
          <>
            <span className="avatar" aria-hidden="true">
              <UserRound />
            </span>
            <span className="user-display-name">{loggedUser.nome.split(' ')[0]}</span>
            <button onClick={handleLogout} className="header-logout" type="button">
              <LogOut aria-hidden="true" />
              <span>Sair</span>
            </button>
          </>
        ) : (
          <ButtonLink to="/login" variant="secondary" size="sm" icon={<LogIn aria-hidden="true" />}>
            Entrar
          </ButtonLink>
        )}
      </div>
    </header>
  )
}

export default Header
