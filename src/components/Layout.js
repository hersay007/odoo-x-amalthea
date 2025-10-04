import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  FileText, 
  CheckCircle, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'manager', 'employee'] },
    { name: 'My Expenses', href: '/expenses', icon: FileText, roles: ['admin', 'manager', 'employee'] },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle, roles: ['admin', 'manager'] },
    { name: 'Team', href: '/team', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Admin Panel', href: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    hasAnyRole(item.roles)
  );

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="overlay-bg"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo">ExpenseManager</h1>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-links">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="nav-icon" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top navigation */}
        <header className="top-header">
          <div className="header-content">
            <div className="header-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="page-title">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="header-right">
              {/* Notifications */}
              <button className="notification-btn">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* User menu */}
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="user-details">
                    <p className="user-name">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="user-role">
                      {user?.role}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;