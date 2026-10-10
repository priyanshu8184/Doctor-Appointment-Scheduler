import React, { useState, useEffect } from 'react'
import './DoctorDashboard.css'
import ConsultationArea from '../components/consultation/ConsultationArea'
import DoctorTodayTab from '../components/doctor/DoctorTodayTab'
import DoctorUpcomingTab from '../components/doctor/DoctorUpcomingTab'
import DoctorAvailabilityTab from '../components/doctor/DoctorAvailabilityTab'
import DoctorPatientsTab from '../components/doctor/DoctorPatientsTab'
import DoctorProfileTab from '../components/doctor/DoctorProfileTab'
import { useDoctorData } from '../hooks/useDoctorData'

const DoctorDashboard = ({ navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem('user')
    if (navigate) navigate('/login')
    else window.location.href = '/login'
  }

  const queryParams = new URLSearchParams(window.location.search)
  const initialTab = queryParams.get('tab') || 'today'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [joinedConsultation, setJoinedConsultation] = useState(null)

  const {
    todayAppointments,
    upcomingAppointments,
    availabilitySlots,
    patients,
    profileData,
    loading,
    error,
    fetchDashboardData,
    handleUpdateAppointmentStatus,
    handleSaveProfile,
    handleAddAvailability,
    handleDeleteAvailability
  } = useDoctorData(navigate)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p className="error-message">{error}</p>
  if (!profileData) return <p>No profile data found.</p>

  if (joinedConsultation) {
    return (
      <div className="doctor-dashboard" style={{ display: 'block', padding: '20px' }}>
        <ConsultationArea 
          appointment={joinedConsultation} 
          role="DOCTOR" 
          onBack={() => setJoinedConsultation(null)} 
        />
      </div>
    )
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
        )
      case 'upcoming':
        return (
          <DoctorUpcomingTab 
            upcomingAppointments={upcomingAppointments}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onJoinConsultation={setJoinedConsultation}
          />
        )
      case 'availability':
        return (
          <DoctorAvailabilityTab 
            availabilitySlots={availabilitySlots}
            onAddAvailability={handleAddAvailability}
            onDeleteAvailability={handleDeleteAvailability}
          />
        )
      case 'patients':
        return (
          <DoctorPatientsTab 
            patients={patients}
          />
        )
      case 'profile':
        return (
          <DoctorProfileTab 
            profileData={profileData}
            onSaveProfile={handleSaveProfile}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="doctor-dashboard">
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">HealPoint</h1>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {profileData && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '0.5rem' }}>
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem' }}>👨‍⚕️</span>
              )}
            </div>
            {sidebarOpen && <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{profileData.name}</p>}
          </div>
        )}

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            📅 Today's Appointments
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            📆 Upcoming
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            ⏰ Availability
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            👥 Patients
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="secondary-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-top">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="content-title">Doctor Dashboard</h1>
          <button 
            type="button" 
            onClick={() => { if (navigate) navigate('/'); else window.location.href = '/'; }} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Go to Home"
            title="Go to Home"
          >
            🏠
          </button>
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default DoctorDashboard
