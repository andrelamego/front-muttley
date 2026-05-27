import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import db from '../data/mockDb';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const isAdmin = path.startsWith('/admin');
  const isUserPage = path.startsWith('/user');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    db.setLoggedUser(null);
    navigate('/login');
  };

  if (isAdmin) {
    return (
      <div className="admin-layout-wrapper">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)} 
        />
        <main className="admin-main-content">
          <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
          <div className="admin-page-scrollable">
            {children}
          </div>
        </main>
      </div>
    );
  }

  if (isUserPage) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent pb-16 md:pb-0">
        <Header />
        <main className="public-layout-full flex-grow">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation Bar (hidden on Desktop/Tablet via CSS) */}
        <nav className="user-bottom-nav" aria-label="Navegação móvel do usuário">
          <Link 
            to="/user/inicio" 
            className={`user-bottom-nav-link ${path === '/user/inicio' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Início</span>
          </Link>
          
          <Link 
            to="/user/certificados" 
            className={`user-bottom-nav-link ${path.startsWith('/user/certificados') ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Certificados</span>
          </Link>
          
          <Link 
            to="/user/medalhas" 
            className={`user-bottom-nav-link ${path.startsWith('/user/medalhas') ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            <span>Medalhas</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="user-bottom-nav-link cursor-pointer border-0 bg-transparent"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-danger">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="text-brand-danger">Sair</span>
          </button>
        </nav>
        
        <Footer />
      </div>
    );
  }

  const isAuthPage = ['/login', '/register', '/certificados/publico'].includes(path);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Header />
      <main className={isAuthPage ? 'public-layout-container' : 'public-layout-full'}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

