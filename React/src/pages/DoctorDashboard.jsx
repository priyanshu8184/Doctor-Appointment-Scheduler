import React, { useState } from 'react'
import './DoctorDashboard.css'

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('today')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Sample data
  const todayAppointments = [
    { id: 1, patientName: 'Md. Hassan Khan', time: '10:00 AM', type: 'Consultation', status: 'Confirmed' },
    { id: 2, patientName: 'Fatima Begum', time: '11:30 AM', type: 'Follow-up', status: 'Confirmed' },
    { id: 3, patientName: 'Ravi Chowdhury', time: '2:00 PM', type: 'Check-up', status: 'Pending' },
  ]

  const upcomingAppointments = [
    { id: 4, patientName: 'Asha Roy', time: 'Tomorrow · 9:00 AM', type: 'Consultation', status: 'Confirmed' },
    { id: 5, patientName: 'Deepak Sharma', time: 'Thursday · 3:15 PM', type: 'Follow-up', status: 'Confirmed' },
    { id: 6, patientName: 'Priya Nair', time: 'Friday · 10:45 AM', type: 'Check-up', status: 'Pending' },
  ]

  const availabilitySlots = [
    { day: 'Monday', slots: '9:00 AM - 5:00 PM' },
    { day: 'Tuesday', slots: '9:00 AM - 5:00 PM' },
    { day: 'Wednesday', slots: '10:00 AM - 4:00 PM' },
    { day: 'Thursday', slots: '9:00 AM - 5:00 PM' },
    { day: 'Friday', slots: '9:00 AM - 5:00 PM' },
  ]

  const patients = [
    { id: 1, name: 'Md. Hassan Khan', visits: 3, lastVisit: '2 days ago' },
    { id: 2, name: 'Fatima Begum', visits: 5, lastVisit: 'Today' },
    { id: 3, name: 'Ravi Chowdhury', visits: 1, lastVisit: '1 week ago' },
    { id: 4, name: 'Asha Roy', visits: 2, lastVisit: '3 days ago' },
  ]

  const profileData = {
    name: 'Dr. Amina Rahman',
    specialization: 'Cardiology',
    experience: '12 years',
    education: 'MBBS, MD (Cardiology)',
    clinic: 'HealPoint Medical Center, Dhaka',
    phone: '+880-1234-567890',
    email: 'dr.amina@healpoint.com',
    bio: 'Specializes in preventive heart care and advanced cardiac diagnostics with a focus on patient education.',
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <section className="dashboard-section">
            <h2>Today's Appointments</h2>
            <div className="appointments-list">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div className="appointment-info">
                      <p className="appointment-patient">{apt.patientName}</p>
                      <p className="appointment-type">{apt.type}</p>
                    </div>
                    <div className="appointment-meta">
                      <span className="appointment-time">{apt.time}</span>
                      <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No appointments today.</p>
              )}
            </div>
          </section>
        )
      case 'upcoming':
        return (
          <section className="dashboard-section">
            <h2>Upcoming Appointments</h2>
            <div className="appointments-list">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div className="appointment-info">
                      <p className="appointment-patient">{apt.patientName}</p>
                      <p className="appointment-type">{apt.type}</p>
                    </div>
                    <div className="appointment-meta">
                      <span className="appointment-time">{apt.time}</span>
                      <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No upcoming appointments.</p>
              )}
            </div>
          </section>
        )
      case 'availability':
        return (
          <section className="dashboard-section">
            <h2>Your Availability</h2>
            <div className="availability-grid">
              {availabilitySlots.map((slot, idx) => (
                <div key={idx} className="availability-card">
                  <p className="availability-day">{slot.day}</p>
                  <p className="availability-time">{slot.slots}</p>
                  <button type="button" className="secondary-btn edit-slot-btn">Edit</button>
                </div>
              ))}
            </div>
          </section>
        )
      case 'patients':
        return (
          <section className="dashboard-section">
            <h2>Your Patients</h2>
            <div className="patients-table">
              <div className="table-header">
                <p className="col-patient">Patient Name</p>
                <p className="col-visits">Total Visits</p>
                <p className="col-last-visit">Last Visit</p>
              </div>
              {patients.map((patient) => (
                <div key={patient.id} className="table-row">
                  <p className="col-patient">{patient.name}</p>
                  <p className="col-visits">{patient.visits}</p>
                  <p className="col-last-visit">{patient.lastVisit}</p>
                </div>
              ))}
            </div>
          </section>
        )
      case 'profile':
        return (
          <section className="dashboard-section">
            <h2>Your Profile</h2>
            <div className="profile-card">
              <div className="profile-header">
                <h3>{profileData.name}</h3>
                <p className="profile-specialization">{profileData.specialization}</p>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <label>Experience</label>
                  <p>{profileData.experience}</p>
                </div>
                <div className="profile-item">
                  <label>Education</label>
                  <p>{profileData.education}</p>
                </div>
                <div className="profile-item">
                  <label>Clinic / Location</label>
                  <p>{profileData.clinic}</p>
                </div>
                <div className="profile-item">
                  <label>Phone</label>
                  <p>{profileData.phone}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="profile-item">
                  <label>Bio</label>
                  <p>{profileData.bio}</p>
                </div>
              </div>

              <button type="button" className="primary-btn edit-profile-btn">Edit Profile</button>
            </div>
          </section>
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
          <button type="button" className="secondary-btn logout-btn">Logout</button>
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
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default DoctorDashboard
