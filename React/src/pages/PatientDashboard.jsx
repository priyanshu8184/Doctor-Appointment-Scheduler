import React, { useState, useEffect } from 'react'
import './PatientDashboard.css'
import { 
  Stethoscope, 
  FileText, 
  Calendar, 
  History as HistoryIcon, 
  User, 
  CreditCard, 
  Star, 
  LogOut, 
  Menu, 
  X, 
  Home 
} from 'lucide-react'

import AiDashboardBanner from '../components/ai/AiDashboardBanner'
import AiLabReportAnalyzer from '../components/ai/AiLabReportAnalyzer'
import ConsultationArea from '../components/consultation/ConsultationArea'
import PostVisitRatingModal from '../components/patient/PostVisitRatingModal'
import PatientUpcomingAppointmentsTab from '../components/patient/PatientUpcomingAppointmentsTab'
import PatientAppointmentHistoryTab from '../components/patient/PatientAppointmentHistoryTab'
import PatientProfileTab from '../components/patient/PatientProfileTab'
import PatientPaymentsTab from '../components/patient/PatientPaymentsTab'
import PatientReviewsTab from '../components/patient/PatientReviewsTab'
import { usePatientData } from '../hooks/usePatientData'

const PatientDashboard = ({ navigate }) => {
  // Synchronous Role-Based Access Control Guard
  const getStoredUser = () => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch (e) {
      return null
    }
  }

  const storedUser = getStoredUser()
  const userRole = (storedUser?.role || '').toUpperCase()

  // Enforce synchronous redirect if role is DOCTOR, ADMIN, or unauthenticated
  useEffect(() => {
    if (!storedUser) {
      if (navigate) navigate('/login')
      else window.location.href = '/login'
    } else if (userRole === 'DOCTOR') {
      if (navigate) navigate('/doctor-dashboard')
      else window.location.href = '/doctor-dashboard'
    } else if (userRole === 'ADMIN') {
      if (navigate) navigate('/admin/dashboard')
      else window.location.href = '/admin/dashboard'
    }
  }, [userRole, storedUser, navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    if (navigate) navigate('/login')
    else window.location.href = '/login'
  }

  const queryParams = new URLSearchParams(window.location.search)
  const initialTab = queryParams.get('tab') || 'upcoming'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [joinedConsultation, setJoinedConsultation] = useState(null)
  const [ratingModalApt, setRatingModalApt] = useState(null)

  const {
    profileData,
    upcomingAppointments,
    appointmentHistory,
    payments,
    reviews,
    API_BASE_URL,
    fetchDashboardData,
    handleSaveProfile,
    handleCancelAppointment,
    handleReschedule,
    handleMakePayment,
    handleSubmitReview,
    handlePostVisitReview
  } = usePatientData(navigate)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getInitials = (name) => {
    if (!name) return 'P'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const nextAppointment = upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
  const patientFirstName = profileData?.firstName || profileData?.name?.split(' ')[0] || 'Patient'

  if (!storedUser || userRole === 'DOCTOR' || userRole === 'ADMIN') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 16 }}>Redirecting to authorized dashboard...</p>
        </div>
      </div>
    )
  }

  if (joinedConsultation) {
    return (
      <div className="patient-dashboard" style={{ display: 'block', padding: '20px' }}>
        <ConsultationArea 
          appointment={joinedConsultation} 
          role="PATIENT" 
          onBack={() => setJoinedConsultation(null)}
          onRateDoctor={(apt) => {
            setJoinedConsultation(null)
            setRatingModalApt(apt)
          }}
        />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'lab-reports':
        return (
          <AiLabReportAnalyzer 
            patientId={storedUser?.user_id || 1} 
            onAppointmentBooked={fetchDashboardData} 
          />
        )
      case 'upcoming':
        return (
          <PatientUpcomingAppointmentsTab 
            upcomingAppointments={upcomingAppointments}
            nextAppointment={nextAppointment}
            onJoinConsultation={setJoinedConsultation}
            onReschedule={handleReschedule}
            onCancel={handleCancelAppointment}
            onOpenReportAnalyzer={() => setActiveTab('lab-reports')}
            navigate={navigate}
          />
        )
      case 'history':
        return (
          <PatientAppointmentHistoryTab 
            appointmentHistory={appointmentHistory}
            reviews={reviews}
            onOpenRatingModal={setRatingModalApt}
          />
        )
      case 'profile':
        return (
          <PatientProfileTab 
            profileData={profileData}
            onSaveProfile={handleSaveProfile}
          />
        )
      case 'payments':
        return (
          <PatientPaymentsTab 
            payments={payments}
            appointments={[...upcomingAppointments, ...appointmentHistory]}
            onMakePayment={handleMakePayment}
          />
        )
      case 'reviews':
        return (
          <PatientReviewsTab 
            reviews={reviews}
            completedAppointments={appointmentHistory}
            onSubmitReview={handleSubmitReview}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="patient-dashboard-layout">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-wrap">
              <Stethoscope size={18} aria-hidden="true" />
            </div>
            <span className="brand-name">HealPoint</span>
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

        {/* Profile Card in Sidebar */}
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar-wrap">
            {profileData?.profilePicture && !imageError ? (
              <img 
                src={profileData.profilePicture} 
                alt={profileData.name} 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="avatar-initials">
                {getInitials(profileData?.name)}
              </div>
            )}
          </div>
          <div className="sidebar-profile-info">
            <p className="sidebar-patient-name">{profileData?.name || 'Demo Patient'}</p>
            <span className="patient-tag">Patient Account</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" aria-label="Patient Dashboard Navigation">
          <button
            type="button"
            className="nav-item book-doctor-action"
            onClick={() => {
              setSidebarOpen(false)
              if (navigate) navigate('/doctors')
              else window.location.href = '/doctors'
            }}
          >
            <Stethoscope size={16} aria-hidden="true" />
            <span>Book Doctor</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upcoming'); setSidebarOpen(false); }}
          >
            <Calendar size={16} aria-hidden="true" />
            <span>Upcoming</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'lab-reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('lab-reports'); setSidebarOpen(false); }}
          >
            <FileText size={16} aria-hidden="true" />
            <span>Report Analyzer</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}
          >
            <HistoryIcon size={16} aria-hidden="true" />
            <span>History</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
          >
            <User size={16} aria-hidden="true" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('payments'); setSidebarOpen(false); }}
          >
            <CreditCard size={16} aria-hidden="true" />
            <span>Payments</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reviews'); setSidebarOpen(false); }}
          >
            <Star size={16} aria-hidden="true" />
            <span>Reviews</span>
          </button>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="sidebar-footer">
          <button 
            type="button" 
            className="sidebar-logout-btn" 
            onClick={handleLogout}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="content-max-width">
          {/* Dashboard Welcome Header */}
          <header className="dashboard-top-header">
            <div className="top-header-left">
              <button
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar navigation"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="welcome-title">Welcome back, {patientFirstName}</h1>
                <p className="welcome-subtitle">Manage appointments, lab reports, and AI medical consultations.</p>
              </div>
            </div>

            <div className="top-header-right">
              <button 
                type="button" 
                className="home-nav-btn"
                onClick={() => { if (navigate) navigate('/'); else window.location.href = '/'; }} 
                aria-label="Go to HealPoint Home"
                title="Go to Home"
              >
                <Home size={17} />
                <span className="home-btn-label">Home</span>
              </button>
            </div>
          </header>

          {/* Ghasitaram AI Assistant Banner */}
          <AiDashboardBanner 
            onTriggerAiAction={(query) => {
              window.dispatchEvent(new CustomEvent('openHealPointAi', { detail: { query } }))
            }} 
            onNavigateTab={(tab) => setActiveTab(tab)}
          />

          {/* Tab Content */}
          <div className="tab-content-container">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Post-Visit Doctor Rating Modal */}
      {ratingModalApt && (
        <PostVisitRatingModal 
          appointment={ratingModalApt}
          onClose={() => setRatingModalApt(null)}
          onSuccess={handlePostVisitReview}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  )
}

export default PatientDashboard
