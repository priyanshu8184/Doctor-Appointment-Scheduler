import React, { useState, useEffect } from 'react';
import './DoctorDashboard.css';
import ConsultationArea from '../components/consultation/ConsultationArea';
import DoctorStatCards from '../components/doctor/DoctorStatCards';
import DoctorTodayTab from '../components/doctor/DoctorTodayTab';
import DoctorUpcomingTab from '../components/doctor/DoctorUpcomingTab';
import DoctorAvailabilityTab from '../components/doctor/DoctorAvailabilityTab';
import DoctorPatientsTab from '../components/doctor/DoctorPatientsTab';
import DoctorProfileTab from '../components/doctor/DoctorProfileTab';
import { useDoctorData } from '../hooks/useDoctorData';
import {
  Calendar,
  CalendarDays,
  Clock,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
  Home,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const DoctorDashboard = ({ navigate }) => {
  const queryParams = new URLSearchParams(window.location.search);
  const initialTab = queryParams.get('tab') || 'today';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joinedConsultation, setJoinedConsultation] = useState(null);

  const {
    todayAppointments,
    upcomingAppointments,
    allDoctorAppointments,
    availabilitySlots,
    patients,
    profileData,
    stats,
    loading,
    error,
    fetchDashboardData,
    handleUpdateAppointmentStatus,
    handleSaveProfile,
    handleAddAvailability,
    handleDeleteAvailability
  } = useDoctorData(navigate);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (navigate) navigate('/login');
    else window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    const clean = name.replace(/^Dr\.?\s*/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  if (joinedConsultation) {
    return (
      <div className="doctor-dashboard" style={{ display: 'block', padding: '20px' }}>
        <ConsultationArea
          appointment={joinedConsultation}
          role="DOCTOR"
          onBack={() => setJoinedConsultation(null)}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <DoctorTodayTab
            todayAppointments={todayAppointments}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onJoinConsultation={setJoinedConsultation}
          />
        );
      case 'upcoming':
        return (
          <DoctorUpcomingTab
            upcomingAppointments={allDoctorAppointments}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onJoinConsultation={setJoinedConsultation}
          />
        );
      case 'availability':
        return (
          <DoctorAvailabilityTab
            availabilitySlots={availabilitySlots}
            onAddAvailability={handleAddAvailability}
            onDeleteAvailability={handleDeleteAvailability}
          />
        );
      case 'patients':
        return (
          <DoctorPatientsTab
            patients={patients}
          />
        );
      case 'profile':
        return (
          <DoctorProfileTab
            profileData={profileData}
            onSaveProfile={handleSaveProfile}
          />
        );
      default:
        return null;
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="doctor-dashboard-layout">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="doctor-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dark Navy Sidebar */}
      <aside className={`doctor-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="doctor-sidebar-brand">
          <div className="brand-logo-icon">
            <HeartPulse size={22} color="#087F72" />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">HealPoint</span>
            <span className="brand-sub">Clinical Portal</span>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Doctor Profile Card in Sidebar (No Emojis, Real avatar or initials) */}
        {profileData && (
          <div className="doctor-sidebar-profile">
            <div className="doc-avatar-ring">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt={profileData.name}
                  className="doc-avatar-img"
                />
              ) : (
                <div className="doc-avatar-initials">
                  {getInitials(profileData.name)}
                </div>
              )}
            </div>
            <div className="doc-profile-info">
              <strong className="doc-name">{profileData.name}</strong>
              <span className="doc-spec">{profileData.specialization}</span>
              <span className="doc-badge">
                <ShieldCheck size={12} />
                <span>Verified Doctor</span>
              </span>
            </div>
          </div>
        )}

        {/* Navigation items with Lucide icons */}
        <nav className="doctor-sidebar-nav">
          <button
            type="button"
            className={`nav-link ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => { setActiveTab('today'); setSidebarOpen(false); }}
          >
            <Calendar size={18} />
            <span>Today's Schedule</span>
            {stats.todayCount > 0 && (
              <span className="nav-count-badge">{stats.todayCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upcoming'); setSidebarOpen(false); }}
          >
            <CalendarDays size={18} />
            <span>All Appointments</span>
            {stats.pendingCount > 0 && (
              <span className="nav-count-badge warning">{stats.pendingCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => { setActiveTab('availability'); setSidebarOpen(false); }}
          >
            <Clock size={18} />
            <span>Availability Shifts</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => { setActiveTab('patients'); setSidebarOpen(false); }}
          >
            <Users size={18} />
            <span>My Patients</span>
            {patients.length > 0 && (
              <span className="nav-count-badge subtle">{patients.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
          >
            <UserCheck size={18} />
            <span>Clinical Profile</span>
          </button>
        </nav>

        <div className="doctor-sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="doctor-main-viewport">
        {/* Top Header Bar */}
        <header className="doctor-header-bar">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="header-greeting">
                Welcome, {profileData?.name || 'Doctor'}
              </h1>
              <span className="header-date-text">{currentDateFormatted}</span>
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="header-home-btn"
              onClick={() => { if (navigate) navigate('/'); else window.location.href = '/'; }}
              title="Return to Public Homepage"
            >
              <Home size={17} />
              <span>Public Home</span>
            </button>
          </div>
        </header>

        {/* Global 4 Stat Cards */}
        <div className="doctor-stat-section">
          <DoctorStatCards stats={stats} loading={loading} />
        </div>

        {/* Active Tab View */}
        <div className="doctor-body-content">
          {loading ? (
            <div className="doc-loading-spinner-wrap">
              <div className="doc-spinner"></div>
              <p>Loading clinical records...</p>
            </div>
          ) : error ? (
            <div className="doc-error-banner">
              <p>Error loading dashboard: {error}</p>
              <button type="button" onClick={fetchDashboardData} className="doc-btn primary sm">
                Retry
              </button>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
