import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import db from '../data/mockDb';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const loggedUser = db.getLoggedUser();

  const handleLogout = () => {
    db.setLoggedUser(null);
    navigate('/login');
  };

  const isActive = (routes: string[]) => {
    return routes.some(route => path.startsWith(route));
  };

  const menuGroups = [
    {
      title: 'Geral',
      links: [
        {
          to: '/admin/inicio',
          label: 'Início',
          active: path === '/admin/inicio',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          )
        }
      ]
    },
    {
      title: 'Gestão',
      links: [
        {
          to: '/admin/eventos',
          label: 'Eventos',
          active: isActive(['/admin/eventos']),
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          to: '/admin/certificados',
          label: 'Certificados',
          active: isActive(['/admin/certificados']),
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          )
        },
        {
          to: '/admin/medalhas',
          label: 'Medalhas',
          active: isActive(['/admin/medalhas']),
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
          )
        },
        {
          to: '/admin/participantes',
          label: 'Pessoas',
          active: isActive(['/admin/participantes']),
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          )
        }
      ]
    },
    {
      title: 'Configurações',
      links: [
        {
          to: '/admin/disciplinas',
          label: 'Disciplinas',
          active: isActive(['/admin/disciplinas']),
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          )
        },
        {
          to: '/admin/locais',
          label: 'Locais',
          active: isActive(['/admin/locais']),
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link className="brand" to="/admin/inicio">
          Muttley
        </Link>
        <button
          className="topbar-hamburger md:hidden"
          type="button"
          onClick={onClose}
          aria-label="Fechar navegação"
          style={{ padding: '0.25rem' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '1.25rem', height: '1.25rem' }}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <nav className="sidebar-menu" aria-label="Navegação administrativa">
        {menuGroups.map(group => (
          <div key={group.title} className="sidebar-group">
            <h4 className="sidebar-group-title">{group.title}</h4>
            <div className="sidebar-links">
              {group.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`sidebar-link ${link.active ? 'active' : ''}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-profile-info">
          <span className="avatar" aria-hidden="true" style={{ width: '2.1rem', height: '2.1rem' }}>
            <svg viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6"></path>
            </svg>
          </span>
          <span className="sidebar-profile-name" title={loggedUser?.nome || 'Administrador'}>
            {loggedUser?.nome.split(' ')[0] || 'Luciano'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-logout"
          title="Fazer logout"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
