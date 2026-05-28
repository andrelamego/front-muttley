import React, { useState } from 'react'
import { Award, FileBadge, Home, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import db from '../data/mockDb'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const isAdmin = path.startsWith('/admin')
  const isUserPage = path.startsWith('/user')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    db.setLoggedUser(null)
    navigate('/login')
  }

  if (isAdmin) {
    return (
      <div className={`admin-layout-wrapper ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
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

        <nav className="user-bottom-nav" aria-label="Navegacao movel do usuario">
          <Link to="/user/inicio" className={`user-bottom-nav-link ${path === '/user/inicio' ? 'active' : ''}`}>
            <Home aria-hidden="true" />
            <span>Inicio</span>
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

          <button onClick={handleLogout} className="user-bottom-nav-link" type="button">
            <LogOut aria-hidden="true" />
            <span>Sair</span>
          </button>
        </nav>

        <Footer />
      </div>
    )
  }

  const isAuthPage = ['/login', '/register', '/certificados/publico'].includes(path)

  return (
    <div className="public-app-shell">
      <Header />
      <main className={isAuthPage ? 'public-layout-container' : 'public-layout-full'}>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
