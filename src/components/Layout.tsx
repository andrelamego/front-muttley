import React, { useState } from 'react'
import { Award, CalendarDays, FileBadge, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import db from '../data/mockDb'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const path = location.pathname
  const isAdmin = path.startsWith('/admin')
  const loggedUser = db.getLoggedUser()
  const isUserPage =
    path.startsWith('/user') ||
    (Boolean(loggedUser) && (path === '/' || path.startsWith('/eventos')))
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (isAdmin) {
    return (
      <div
        className={`admin-layout-wrapper ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapsed={() => setIsSidebarCollapsed((value) => !value)}
        />
        <button
          type="button"
          aria-label="Fechar navegacao"
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <main className="admin-main-content">
          <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
          <div className="admin-page-scrollable">{children}</div>
        </main>
      </div>
    )
  }

  if (isUserPage) {
    return (
      <div className="user-app-shell">
        <Header />
        <main className="public-layout-full">{children}</main>

        <nav
          className="user-bottom-nav"
          aria-label="Navegacao movel do usuario"
        >
          <Link
            to="/user/inicio"
            className={`user-bottom-nav-link ${path === '/user/inicio' ? 'active' : ''}`}
          >
            <Home aria-hidden="true" />
            <span>Inicio</span>
          </Link>

          <Link
            to="/eventos"
            className={`user-bottom-nav-link ${path === '/' || path.startsWith('/eventos') ? 'active' : ''}`}
          >
            <CalendarDays aria-hidden="true" />
            <span>Eventos</span>
          </Link>

          <Link
            to="/user/certificados"
            className={`user-bottom-nav-link ${path.startsWith('/user/certificados') ? 'active' : ''}`}
          >
            <FileBadge aria-hidden="true" />
            <span>Certificados</span>
          </Link>

          <Link
            to="/user/medalhas"
            className={`user-bottom-nav-link ${path.startsWith('/user/medalhas') ? 'active' : ''}`}
          >
            <Award aria-hidden="true" />
            <span>Medalhas</span>
          </Link>
        </nav>

        <Footer />
      </div>
    )
  }

  const isAuthPage = ['/login', '/register'].includes(path)

  return (
    <div className="public-app-shell">
      <Header />
      <main
        className={
          isAuthPage ? 'public-layout-container' : 'public-layout-full'
        }
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
