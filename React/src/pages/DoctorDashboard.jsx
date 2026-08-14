import React, { useState, useEffect, useRef } from 'react'
import './DoctorDashboard.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { io } from 'socket.io-client'
import Peer from 'peerjs'

const DoctorDashboard = ({ navigate }) => {
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
  const [joinedConsultation, setJoinedConsultation] = useState(null)
  const [profileForm, setProfileForm] = useState({})
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [certificateFile, setCertificateFile] = useState(null)

  // Availability form states
  const [availFormType, setAvailFormType] = useState('SPECIFIC_DATE')
  const [availFormDay, setAvailFormDay] = useState('MONDAY')
  const [availFormDate, setAvailFormDate] = useState('')
  const [availFormStatus, setAvailFormStatus] = useState('AVAILABLE')
  const [availFormStart, setAvailFormStart] = useState('')
  const [availFormEnd, setAvailFormEnd] = useState('')

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
          profilePicture: dbDoctor.profile_picture ? `${API_BASE_URL.replace('/api', '')}${dbDoctor.profile_picture}` : null,
          certificate: dbDoctor.certificate ? `${API_BASE_URL.replace('/api', '')}${dbDoctor.certificate}` : null
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
            type: apt.appointment_type,
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
          id: slot.availability_id,
          day: slot.specific_date ? `Date: ${slot.specific_date}` : `Every ${slot.day_of_week}`,
          slots: slot.is_available ? `${slot.start_time} - ${slot.end_time}` : 'Unavailable (Blocked)',
          is_available: slot.is_available
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
      if (certificateFile) payload.append('certificate', certificateFile)

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

  const handleAddAvailability = async (e) => {
    e.preventDefault()
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'))
      const payload = {
        doctor_id: loggedInUser.user_id,
        is_available: availFormStatus === 'AVAILABLE'
      }

      if (availFormType === 'RECURRING') {
        payload.day_of_week = availFormDay
      } else {
        payload.specific_date = availFormDate
      }

      if (payload.is_available) {
        payload.start_time = availFormStart
        payload.end_time = availFormEnd
      }

      await axios.post(`${API_BASE_URL}/doctor-availability`, payload)
      alert("Availability added successfully!")
      window.location.reload()
    } catch (err) {
      alert("Failed to add availability: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm("Are you sure you want to delete this availability rule?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/doctor-availability/${id}`)
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id))
    } catch (err) {
      alert("Failed to delete availability: " + (err.response?.data?.message || err.message))
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                          {apt.status === 'ACCEPTED' && (
                            <button 
                              onClick={() => setJoinedConsultation(apt)} 
                              className="primary-btn" 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#0f766e' }}
                            >
                              Join
                            </button>
                          )}
                        </div>
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                          {apt.status === 'ACCEPTED' && (
                            <button 
                              onClick={() => setJoinedConsultation(apt)} 
                              className="primary-btn" 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#0f766e' }}
                            >
                              Join
                            </button>
                          )}
                        </div>
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
            
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Rule</h3>
              <form onSubmit={handleAddAvailability} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
                  Rule Type
                  <select value={availFormType} onChange={(e) => setAvailFormType(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="SPECIFIC_DATE">Specific Date</option>
                    <option value="RECURRING">Recurring Weekly</option>
                  </select>
                </label>

                {availFormType === 'RECURRING' ? (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
                    Day of Week
                    <select value={availFormDay} onChange={(e) => setAvailFormDay(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="SUNDAY">Sunday</option>
                    </select>
                  </label>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
                    Select Date
                    <input type="date" value={availFormDate} onChange={(e) => setAvailFormDate(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                )}

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
                  Status
                  <select value={availFormStatus} onChange={(e) => setAvailFormStatus(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable (Block)</option>
                  </select>
                </label>

                {availFormStatus === 'AVAILABLE' ? (
                  <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, flex: 1 }}>
                      Start Time
                      <input type="time" value={availFormStart} onChange={(e) => setAvailFormStart(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, flex: 1 }}>
                      End Time
                      <input type="time" value={availFormEnd} onChange={(e) => setAvailFormEnd(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </label>
                  </div>
                ) : null}

                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <button type="submit" className="primary-btn">Add Availability Rule</button>
                </div>
              </form>
            </div>

            <div className="availability-grid">
              {availabilitySlots.map((slot, idx) => (
                <div key={idx} className="availability-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <p className="availability-day">{slot.day}</p>
                  <p className="availability-time" style={{ color: slot.is_available ? '#334155' : '#ef4444', fontWeight: slot.is_available ? 500 : 700 }}>
                    {slot.slots}
                  </p>
                  <button type="button" onClick={() => handleDeleteAvailability(slot.id)} className="secondary-btn edit-slot-btn" style={{ marginTop: 'auto', border: '1px solid #ef4444', color: '#ef4444', background: '#fef2f2' }}>Delete</button>
                </div>
              ))}
              {availabilitySlots.length === 0 && (
                <p>No availability rules set.</p>
              )}
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
                  MBBS Certificate
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setCertificateFile(e.target.files[0])} />
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
                <div className="profile-item full-width" style={{ gridColumn: '1 / -1' }}>
                  <label>MBBS Certificate</label>
                  {profileData.certificate ? (
                    <a href={profileData.certificate} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      View Uploaded Certificate
                    </a>
                  ) : (
                    <p style={{ color: '#94a3b8' }}>No certificate uploaded</p>
                  )}
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

  if (joinedConsultation) {
    return (
      <div className="doctor-dashboard" style={{ display: 'block', padding: '20px' }}>
        <ConsultationArea appointment={joinedConsultation} role="DOCTOR" onBack={() => setJoinedConsultation(null)} />
      </div>
    )
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
            onClick={() => navigate('/home')} 
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

const ConsultationArea = ({ appointment, role, onBack }) => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [callStatus, setCallStatus] = useState('Disconnected')
  const [peerInstance, setPeerInstance] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localAudioRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    // 1. Fetch Message History
    axios.get(`http://localhost:3001/api/messages/${appointment.id}`)
      .then(res => setMessages(res.data.messages || []))
      .catch(err => console.error("Error fetching message history:", err))

    // 2. Initialize Socket.io
    const socket = io('http://localhost:3001')
    socketRef.current = socket

    socket.emit('join_room', { appointmentId: appointment.id })

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data])
    })

    // 3. Initialize PeerJS (WebRTC) for Audio/Video
    if (appointment.type === 'AUDIO' || appointment.type === 'VIDEO') {
      const myPeerId = `appointment_${appointment.id}_${role.toLowerCase()}`
      const peer = new Peer(myPeerId)
      setPeerInstance(peer)

      peer.on('open', (id) => {
        console.log('PeerJS open with ID:', id)
        setCallStatus('Ready to connect')
      })

      peer.on('error', (err) => {
        console.error('PeerJS error:', err)
        setCallStatus(`Error: ${err.type}`)
      })

      peer.on('call', async (incomingCall) => {
        console.log('Answering incoming call from:', incomingCall.peer)
        try {
          const stream = await getLocalStream()
          incomingCall.answer(stream)
          setActiveCall(incomingCall)
          setCallStatus('Connected')

          incomingCall.on('stream', (remoteStream) => {
            attachRemoteStream(remoteStream)
          })

          incomingCall.on('close', () => {
            handleCallEnded()
          })
        } catch (err) {
          console.error("Failed to answer call:", err)
        }
      })
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [appointment.id])

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current
    
    const constraints = {
      video: appointment.type === 'VIDEO',
      audio: true
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStreamRef.current = stream

    if (appointment.type === 'VIDEO' && localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    return stream
  }

  const attachRemoteStream = (remoteStream) => {
    if (appointment.type === 'VIDEO' && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    } else if (appointment.type === 'AUDIO' && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream
    }
  }

  const handleStartCall = async () => {
    const targetPeerId = `appointment_${appointment.id}_${role === 'DOCTOR' ? 'patient' : 'doctor'}`
    setCallStatus('Calling...')
    try {
      const stream = await getLocalStream()
      const call = peerInstance.call(targetPeerId, stream)
      setActiveCall(call)

      call.on('stream', (remoteStream) => {
        attachRemoteStream(remoteStream)
        setCallStatus('Connected')
      })

      call.on('close', () => {
        handleCallEnded()
      })
      
      call.on('error', (err) => {
        console.error('Call error:', err)
        setCallStatus('Failed to connect')
      })
    } catch (err) {
      console.error("Failed to make call:", err)
      setCallStatus('Failed to get media devices')
    }
  }

  const handleEndCall = () => {
    if (activeCall) activeCall.close()
    handleCallEnded()
  }

  const handleCallEnded = () => {
    setActiveCall(null)
    setCallStatus('Call ended')
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    socketRef.current.emit('send_message', {
      appointmentId: appointment.id,
      senderId: user.user_id,
      senderRole: role,
      messageText: inputText,
      senderEmail: user.email
    })
    setInputText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      {/* Header */}
      <div style={{ padding: '16px', background: '#0f766e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginRight: '10px', fontSize: '1.1rem' }}>⬅ Back</button>
          <span style={{ fontWeight: 'bold' }}>Consultation with {role === 'DOCTOR' ? appointment.patientName : appointment.doctorName}</span>
          <span style={{ marginLeft: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{appointment.type}</span>
        </div>
        <div>
          {appointment.type !== 'MESSAGING' && (
            <span>Status: <strong>{callStatus}</strong></span>
          )}
        </div>
      </div>

      {/* Main body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Media Pane */}
        {appointment.type !== 'MESSAGING' && (
          <div style={{ flex: 1.5, background: '#1e293b', display: 'flex', flexDirection: 'column', padding: '20px', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {appointment.type === 'VIDEO' ? (
              <div style={{ display: 'flex', gap: '20px', width: '100%', height: '80%', justifyContent: 'center' }}>
                {/* Remote Stream */}
                <div style={{ flex: 1, background: '#0f172a', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>
                    {role === 'DOCTOR' ? 'Patient' : 'Doctor'}
                  </span>
                </div>
                {/* Local Stream */}
                <div style={{ width: '150px', height: '110px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', position: 'absolute', top: '30px', right: '30px', border: '2px solid white' }}>
                  <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: '5px', left: '5px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: '2px', fontSize: '0.7rem' }}>
                    You
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>📞</div>
                <h3>Audio Call</h3>
                <audio ref={remoteAudioRef} autoPlay />
                <audio ref={localAudioRef} autoPlay muted />
              </div>
            )}

            {/* Media Controls */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              {!activeCall ? (
                <button onClick={handleStartCall} className="primary-btn" style={{ background: '#10b981', padding: '10px 20px' }}>Connect Call</button>
              ) : (
                <button onClick={handleEndCall} className="secondary-btn" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px' }}>Disconnect</button>
              )}
            </div>
          </div>
        )}

        {/* Chat Pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #cbd5e1', background: 'white' }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #cbd5e1', fontWeight: 'bold', color: '#1e293b' }}>Chat Messages</div>
          
          {/* Messages list */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === user.user_id;
              return (
                <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: isMe ? 'right' : 'left', marginBottom: '2px' }}>
                    {isMe ? 'You' : msg.User?.email || msg.sender_role}
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isMe ? '#0f766e' : '#f1f5f9',
                    color: isMe ? 'white' : '#1e293b'
                  }}>
                    {msg.message_text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid #cbd5e1', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <button type="submit" className="primary-btn" style={{ padding: '8px 16px', background: '#0f766e' }}>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}
