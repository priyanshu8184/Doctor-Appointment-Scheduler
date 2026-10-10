import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Calendar,
  BarChart3,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ 
  children, 
  activeTab, 
  onSelectTab, 
  navigate, 
  pendingApprovalsCount = 0,
  pageTitle = 'Dashboard Overview'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const adminName = storedUser?.first_name 
    ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim()
    : 'System Administrator';

  const adminInitials = storedUser?.first_name ? storedUser.first_name[0] : 'A';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('user-auth-change'));
    if (navigate) {
      navigate('/admin/login');
    } else {
      window.location.href = '/admin/login';
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { 
      id: 'doctors', 
      label: 'Doctor Approvals & Directory', 
      icon: UserCheck, 
      path: '/admin/doctors',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
    },
    { id: 'patients', label: 'Patient Accounts', icon: Users, path: '/admin/patients' },
    { id: 'appointments', label: 'Appointment Management', icon: Calendar, path: '/admin/appointments' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, path: '/admin/reports' },
    { id: 'audit-logs', label: 'Security Audit Logs', icon: ShieldAlert, path: '/admin/audit-logs' }
  ];

  const handleNavClick = (item) => {
    if (onSelectTab) {
      onSelectTab(item.id);
    }
    if (navigate && item.path) {
      navigate(item.path);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout-root">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon-box">
              <Stethoscope size={18} />
            </div>
            <span className="admin-sidebar-brand-name">HealPoint Admin</span>
          </div>
          <button 
            type="button" 
            className="admin-sidebar-close" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="admin-sidebar-user">
          <div className="admin-avatar">
            {adminInitials}
          </div>
          <div className="admin-user-info">
            <p className="admin-user-name" title={adminName}>{adminName}</p>
            <p className="admin-user-role">Super Administrator</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-page-title">{pageTitle}</h1>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-live-badge">
              <span className="live-dot" />
              <span>System Live</span>
            </div>

            <button
              type="button"
              className="admin-topbar-btn"
              onClick={() => { if (navigate) navigate('/'); else window.location.href = '/'; }}
              title="Visit Main Site"
            >
              <span>Main Site</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </header>

        <main className="admin-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
