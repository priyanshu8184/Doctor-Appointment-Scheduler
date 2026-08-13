import React, { useState, useEffect } from 'react'
import './DoctorDashboard.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

const DoctorDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const [activeTab, setActiveTab] = useState('today')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1. Define states to store backend data
  const [todayAppointments, setTodayAppointments] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [patients, setPatients] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [profilePictureFile, setProfilePictureFile] = useState(null)

  // 2. Base API URL (pointing to your Express backend)
  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  // 3. Fetch data from backend on component mount
  useEffect(() => {
    // Get logged-in doctor details from localStorage (saved during Login)
    const loggedInUser = JSON.parse(localStorage.getItem('user'))
    const doctorId = loggedInUser?.user_id // Ensure your user object contains their ID

    if (!doctorId) {
      setError("User not authenticated. Please log in.")
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // A. Fetch Doctor Profile details
        const profileRes = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`)
        const dbDoctor = profileRes.data.doctor || {}
        setProfileData({
          name: `Dr. ${dbDoctor.first_name} ${dbDoctor.last_name}`,
          specialization: dbDoctor.specialization || 'General',
          experience: dbDoctor.experience || 'N/A',
          education: dbDoctor.education || 'N/A',
          clinic: dbDoctor.location || 'N/A',
          phone: dbDoctor.phone_number || 'N/A',
          email: loggedInUser.email,
          bio: dbDoctor.bio || 'No bio provided.',
          profilePicture: dbDoctor.profile_picture ? `${API_BASE_URL.replace('/api', '')}${dbDoctor.profile_picture}` : null
        })

        // B. Fetch Appointments for this doctor
        const appointmentsRes = await axios.get(`${API_BASE_URL}/appointments`)
        const allAppointments = appointmentsRes.data.appointments || []
        
        // Filter and map
        const myApts = allAppointments
          .filter(a => a.doctor_id === doctorId)
          .map(apt => ({
            id: apt.appointment_id,
            patientName: `Patient #${apt.patient_id}`,
            type: 'Consultation',
            date: apt.appointment_datetime,
            time: new Date(apt.appointment_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: apt.status
          }))

        const today = new Date().toDateString()
        setTodayAppointments(myApts.filter(apt => new Date(apt.date).toDateString() === today))
        setUpcomingAppointments(myApts.filter(apt => new Date(apt.date).toDateString() !== today))

        // C. Fetch Availability Slots
        const availabilityRes = await axios.get(`${API_BASE_URL}/doctor-availability/doctor/${doctorId}`)
        const availabilityArray = availabilityRes.data.availability || []
        setAvailabilitySlots(availabilityArray.map(slot => ({
          day: slot.day_of_week,
          slots: `${slot.start_time} - ${slot.end_time}`
        })))

        // D. Fetch Patients
        const patientsRes = await axios.get(`${API_BASE_URL}/patients`)
        const allPatients = patientsRes.data.patients || []
        setPatients(allPatients.slice(0, 5).map(p => ({
          id: p.patient_id,
          name: `${p.first_name} ${p.last_name}`,
          visits: 1,
          lastVisit: 'Recent'
        })))

      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p className="error-message">{error}</p>
  if (!profileData) return <p>No profile data found.</p>

  const handleEditProfileClick = () => {
    setProfileForm({
      education: profileData.education !== 'N/A' ? profileData.education : '',
      phone_number: profileData.phone !== 'N/A' ? profileData.phone : '',
      experience: profileData.experience !== 'N/A' ? profileData.experience : '',
      location: profileData.clinic !== 'N/A' ? profileData.clinic : '',
      bio: profileData.bio !== 'No bio provided.' ? profileData.bio : ''
    })
    setIsEditingProfile(true)
  }

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'))
      const payload = new FormData()
      Object.keys(profileForm).forEach(key => payload.append(key, profileForm[key]))
      if (profilePictureFile) payload.append('profile_picture', profilePictureFile)

      await axios.put(`${API_BASE_URL}/doctors/${loggedInUser.user_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert("Profile updated successfully!")
      window.location.reload()
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message))
    }
  }

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, { status });
      // Refresh local state to reflect the change
      setTodayAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status } : apt));
      setUpcomingAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status } : apt));
    } catch (err) {
      alert("Failed to update appointment: " + (err.response?.data?.message || err.message));
    }
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
                      {apt.status === 'SCHEDULED' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateAppointmentStatus(apt.id, 'ACCEPTED')} className="primary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Accept</button>
                          <button onClick={() => handleUpdateAppointmentStatus(apt.id, 'REJECTED')} className="secondary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Reject</button>
                        </div>
                      ) : (
                        <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      )}
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
                      <span className="appointment-time">{apt.date.split('T')[0]} {apt.time}</span>
                      {apt.status === 'SCHEDULED' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateAppointmentStatus(apt.id, 'ACCEPTED')} className="primary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Accept</button>
                          <button onClick={() => handleUpdateAppointmentStatus(apt.id, 'REJECTED')} className="secondary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Reject</button>
                        </div>
                      ) : (
                        <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      )}
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
        if (isEditingProfile) {
          return (
            <section className="dashboard-section">
              <h2>Edit Profile</h2>
              <form className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
                <label>
                  Profile Picture
                  <input type="file" accept="image/*" onChange={(e) => setProfilePictureFile(e.target.files[0])} />
                </label>
                <label>
                  Experience
                  <input type="text" name="experience" value={profileForm.experience || ''} onChange={handleProfileChange} />
                </label>
                <label>
                  Education
                  <input type="text" name="education" value={profileForm.education || ''} onChange={handleProfileChange} />
                </label>
                <label>
                  Clinic / Location
                  <input type="text" name="location" value={profileForm.location || ''} onChange={handleProfileChange} />
                </label>
                <label>
                  Phone Number
                  <input type="text" name="phone_number" value={profileForm.phone_number || ''} onChange={handleProfileChange} />
                </label>
                <label>
                  Bio
                  <textarea name="bio" value={profileForm.bio || ''} onChange={handleProfileChange} rows="4"></textarea>
                </label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="primary-btn" onClick={handleSaveProfile}>Save Changes</button>
                  <button type="button" className="secondary-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                </div>
              </form>
            </section>
          )
        }

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

              <button type="button" className="primary-btn edit-profile-btn" onClick={handleEditProfileClick}>Edit Profile</button>
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
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default DoctorDashboard
