import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const isAdmin = path.startsWith('/admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
