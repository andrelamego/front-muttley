import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CalendarDays,
  FileBadge,
  Home,
  LogOut,
  MapPin,
  PanelLeftOpen,
  PanelLeftClose,
  UsersRound,
} from 'lucide-react'
import db from '../data/mockDb'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapsed: () => void
}

type SidebarLink = {
  to: string
  label: string
  icon: React.ReactNode
  routes: string[]
}

const menuGroups: Array<{ title: string; links: SidebarLink[] }> = [
  {
    title: 'Geral',
    links: [
      {
        to: '/admin/inicio',
        label: 'Inicio',
        icon: <Home aria-hidden="true" />,
        routes: ['/admin/inicio'],
      },
    ],
  },
  {
    title: 'Gestao',
    links: [
      {
        to: '/admin/eventos',
        label: 'Eventos',
        icon: <CalendarDays aria-hidden="true" />,
        routes: ['/admin/eventos'],
      },
      {
        to: '/admin/certificados',
        label: 'Certificados',
        icon: <FileBadge aria-hidden="true" />,
        routes: ['/admin/certificados'],
      },
      {
        to: '/admin/medalhas',
        label: 'Medalhas',
        icon: <Award aria-hidden="true" />,
        routes: ['/admin/medalhas'],
      },
      {
        to: '/admin/participantes',
        label: 'Pessoas',
        icon: <UsersRound aria-hidden="true" />,
        routes: ['/admin/participantes'],
      },
    ],
  },
  {
    title: 'Configuracoes',
    links: [
      {
        to: '/admin/disciplinas',
        label: 'Disciplinas',
        icon: <BookOpen aria-hidden="true" />,
        routes: ['/admin/disciplinas'],
      },
      {
        to: '/admin/locais',
        label: 'Locais',
        icon: <MapPin aria-hidden="true" />,
        routes: ['/admin/locais'],
      },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapsed,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const loggedUser = db.getLoggedUser()

  const handleLogout = () => {
    db.setLoggedUser(null)
    navigate('/login')
  }

  const isActive = (routes: string[]) =>
    routes.some((route) => path.startsWith(route))

  return (
    <aside
      className={`sidebar sidebar--redesign ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
    >
      <div className="sidebar-header">
        <Link
          className="brand sidebar-brand"
          to="/admin/inicio"
          onClick={onClose}
        >
          Muttley
        </Link>
        <button
          className="sidebar-collapse-toggle"
          type="button"
          onClick={onToggleCollapsed}
          aria-label={
            isCollapsed ? 'Expandir barra lateral' : 'Compactar barra lateral'
          }
          aria-pressed={isCollapsed}
          title={
            isCollapsed ? 'Expandir barra lateral' : 'Compactar barra lateral'
          }
        >
          {isCollapsed ? (
            <PanelLeftOpen aria-hidden="true" />
          ) : (
            <PanelLeftClose aria-hidden="true" />
          )}
        </button>
        <button
          className="sidebar-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar navegacao"
        >
          <PanelLeftClose aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar-menu" aria-label="Navegacao administrativa">
        {menuGroups.map((group) => (
          <div key={group.title} className="sidebar-group">
            <h4 className="sidebar-group-title">{group.title}</h4>
            <div className="sidebar-links">
              {group.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`sidebar-link ${isActive(link.routes) ? 'active' : ''}`}
                >
                  {link.icon}
                  <span className="sidebar-link-label">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-profile-info">
          <span className="avatar" aria-hidden="true">
            {loggedUser?.nome?.charAt(0) || 'A'}
          </span>
          <span
            className="sidebar-profile-name"
            title={loggedUser?.nome || 'Administrador'}
          >
            {loggedUser?.nome?.split(' ')[0] || 'Admin'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-logout"
          title="Fazer logout"
          type="button"
        >
          <LogOut aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
