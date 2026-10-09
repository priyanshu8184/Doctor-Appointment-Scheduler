import React, { useState, useEffect, useRef } from 'react'
import './PatientDashboard.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { io } from 'socket.io-client'
import Peer from 'peerjs'
import AiDashboardBanner from '../components/ai/AiDashboardBanner'
import AiLabReportAnalyzer from '../components/ai/AiLabReportAnalyzer'
import { SAMPLE_DOCTORS } from '../../../AI/index.js'

// Helper to resolve registered doctor information
const resolveDoctorInfo = (docId, doctorsMap = {}) => {
  if (docId && doctorsMap[docId]) {
    const d = doctorsMap[docId];
    return {
      name: d.name || (d.first_name ? `Dr. ${d.first_name} ${d.last_name}` : 'Dr. Priya Nair'),
      specialty: d.specialty || d.specialization || 'General Medicine',
      location: d.location || 'HealPoint Health Clinic'
    };
  }
  const found = (SAMPLE_DOCTORS || []).find(d => d.doctor_id === Number(docId)) || 
    (SAMPLE_DOCTORS || []).find(d => d.doctor_id === 104) || 
    SAMPLE_DOCTORS[0] || 
    { name: 'Dr. Priya Nair', specialty: 'General Medicine', location: 'HealPoint Health Clinic' };
  
  return {
    name: found.name,
    specialty: found.specialty || found.specialties?.[0] || 'General Medicine',
    location: found.location || 'HealPoint Health Clinic'
  };
};

const PatientDashboard = ({ navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  // Parse URL search parameters for default active tab (e.g. ?tab=lab-reports)
  const queryParams = new URLSearchParams(window.location.search)
  const initialTab = queryParams.get('tab') || 'upcoming'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Default sample patient profile
  const defaultProfile = {
    firstName: 'Demo',
    lastName: 'Patient',
    name: 'Demo Patient',
    email: 'demo.patient@healpoint.com',
    phone: '+1 (555) 019-2834',
    dateOfBirth: '1994-08-12',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '124 Healthcare Ave, Suite 4B',
    emergencyContact: '+1 (555) 019-9988',
    profilePicture: null
  }

  // Sample fallback appointments
  const defaultAppointments = [
    {
      id: 101,
      doctorName: 'Dr. Rahul Sharma',
      specialization: 'Dermatology',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '04:30 PM',
      status: 'SCHEDULED',
      type: 'VIDEO',
      location: 'HealPoint Health Clinic'
    },
    {
      id: 102,
      doctorName: 'Dr. Ananya Iyer',
      specialization: 'Cardiology',
      date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '06:00 PM',
      status: 'ACCEPTED',
      type: 'VIDEO',
      location: 'HealPoint Heart Institute'
    }
  ]

  // 1. Define states to store backend data
  const [upcomingAppointments, setUpcomingAppointments] = useState(defaultAppointments)
  const [appointmentHistory, setAppointmentHistory] = useState([
    {
      id: 99,
      doctorName: 'Dr. Priya Nair',
      specialization: 'General Medicine',
      date: '2026-09-20',
      time: '11:00 AM',
      status: 'COMPLETED',
      type: 'IN_PERSON',
      notes: 'Routine health checkup and blood pressure monitoring.'
    }
  ])
  const [payments, setPayments] = useState([
    {
      id: 501,
      date: '2026-09-20',
      doctorName: 'Dr. Priya Nair',
      amount: '$50.00',
      status: 'COMPLETED',
      method: 'FULL_FEE'
    }
  ])
  const [reviews, setReviews] = useState([
    {
      id: 301,
      doctorName: 'Dr. Priya Nair',
      rating: 5,
      date: '2026-09-21',
      reviewText: 'Excellent consultation! Doctor was very attentive and helpful.'
    }
  ])
  const [profileData, setProfileData] = useState(defaultProfile)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState(defaultProfile)
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  
  const [reviewForm, setReviewForm] = useState({ appointmentId: '', rating: 5, comment: '' })
  const [paymentAppointmentId, setPaymentAppointmentId] = useState('')

  const [rescheduleId, setRescheduleId] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [joinedConsultation, setJoinedConsultation] = useState(null)

  // 2. Base API URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  // 3. Fetch data from backend on component mount
  const fetchDashboardData = async () => {
    // Get logged-in patient details from localStorage
    let loggedInUser = null
    try {
      const userStr = localStorage.getItem('user')
      loggedInUser = userStr ? JSON.parse(userStr) : null
    } catch (e) {
      loggedInUser = null
    }

    if (!loggedInUser) {
      loggedInUser = {
        user_id: 1,
        email: 'demo.patient@healpoint.com',
        first_name: 'Demo',
        last_name: 'Patient',
        role: 'PATIENT'
      }
      localStorage.setItem('user', JSON.stringify(loggedInUser))
    }

    const patientId = loggedInUser.user_id

    try {
      // A. Fetch Patient Profile details
      const profileRes = await axios.get(`${API_BASE_URL}/patients/${patientId}`)
      const dbPatient = profileRes.data.patient || {}
      const fullProfile = {
        firstName: dbPatient.first_name || loggedInUser.first_name || 'Demo',
        lastName: dbPatient.last_name || loggedInUser.last_name || 'Patient',
        name: `${dbPatient.first_name || loggedInUser.first_name || 'Demo'} ${dbPatient.last_name || loggedInUser.last_name || 'Patient'}`,
        email: loggedInUser.email || 'demo.patient@healpoint.com',
        phone: dbPatient.phone_number || '+1 (555) 019-2834',
        dateOfBirth: dbPatient.date_of_birth || '1994-08-12',
        gender: dbPatient.gender || 'Male',
        bloodGroup: dbPatient.blood_group || 'O+',
        address: dbPatient.address || '124 Healthcare Ave, Suite 4B',
        emergencyContact: dbPatient.emergency_contact || '+1 (555) 019-9988',
        profilePicture: dbPatient.profile_picture ? `${API_BASE_URL.replace('/api', '')}${dbPatient.profile_picture}` : null
      }
      setProfileData(fullProfile)
      setProfileForm(fullProfile)

      // B. Fetch Doctors Directory & Appointments
      let doctorsMap = {}
      try {
        const docsRes = await axios.get(`${API_BASE_URL}/doctors`)
        const docsList = docsRes.data.doctors || docsRes.data || []
        docsList.forEach(d => {
          const id = d.doctor_id || d.id
          if (id) doctorsMap[id] = d
        })
      } catch (docErr) {
        console.warn('Doctors directory fetch fallback to local registry:', docErr.message)
      }

      const appointmentsRes = await axios.get(`${API_BASE_URL}/appointments`)
      const allAppointments = appointmentsRes.data.appointments || []
      const myApts = allAppointments
        .filter(a => String(a.patient_id) === String(patientId))
        .map(apt => {
          const docInfo = resolveDoctorInfo(apt.doctor_id, doctorsMap)
          return {
            id: apt.appointment_id,
            doctorName: apt.doctor_name || docInfo.name,
            specialization: apt.specialization || docInfo.specialty,
            date: apt.appointment_datetime,
            time: new Date(apt.appointment_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: apt.status,
            type: apt.appointment_type || 'VIDEO',
            location: apt.location || docInfo.location
          }
        })

      if (myApts.length > 0) {
        const now = new Date()
        const upcoming = myApts.filter(apt => new Date(apt.date) >= now && apt.status !== 'CANCELLED')
        const history = myApts.filter(apt => new Date(apt.date) < now || apt.status === 'CANCELLED')
        setUpcomingAppointments(upcoming)
        setAppointmentHistory(history)
      }

      // C. Fetch Payments
      const paymentsRes = await axios.get(`${API_BASE_URL}/payments/patient/${patientId}`)
      const allPayments = paymentsRes.data.payments || []
      if (allPayments.length > 0) {
        setPayments(allPayments.map(p => {
          const docInfo = resolveDoctorInfo(p.doctor_id || 104, doctorsMap)
          return {
            id: p.payment_id,
            date: new Date(p.created_at).toLocaleDateString(),
            doctorName: p.doctor_name || docInfo.name,
            amount: `$${p.total_amount || '50.00'}`,
            status: p.payment_status,
            method: p.payment_type
          }
        }))
      }

      // D. Fetch Reviews
      const reviewsRes = await axios.get(`${API_BASE_URL}/reviews/patient/${patientId}`)
      const allReviews = reviewsRes.data.reviews || []
      if (allReviews.length > 0) {
        setReviews(allReviews.map(r => {
          const docInfo = resolveDoctorInfo(r.doctor_id || 104, doctorsMap)
          return {
            id: r.review_id,
            doctorName: r.doctor_name || docInfo.name,
            rating: r.rating,
            date: new Date(r.created_at).toLocaleDateString(),
            reviewText: r.comment
          }
        }))
      }
    } catch (err) {
      console.warn("Backend API not reachable, using local fallback state:", err.message)
      // Do not block dashboard with fatal error screen
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleSaveProfile = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'))
      const payload = new FormData()
      payload.append('first_name', profileForm.firstName || '')
      payload.append('last_name', profileForm.lastName || '')
      payload.append('date_of_birth', profileForm.dateOfBirth || '')
      payload.append('phone_number', profileForm.phone || '')
      payload.append('gender', profileForm.gender || '')
      payload.append('blood_group', profileForm.bloodGroup || '')
      payload.append('address', profileForm.address || '')
      payload.append('emergency_contact', profileForm.emergencyContact || '')
      
      if (profilePictureFile) {
        payload.append('profile_picture', profilePictureFile)
      }

      await axios.put(`${API_BASE_URL}/patients/${loggedInUser.user_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Update local state and close editor
      setProfileData({ ...profileData, ...profileForm, name: `${profileForm.firstName} ${profileForm.lastName}` })
      setIsEditingProfile(false)
      window.location.reload()
    } catch (err) {
      alert("Failed to update profile")
      console.error(err)
    }
  }

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.appointmentId) {
      alert("Please select an appointment")
      return
    }
    
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'))
      // Find doctor ID for the selected appointment (assuming we parse it or backend just uses it)
      // Since our mock history maps doctorName to "Doctor #X", we need to extract the ID, but wait, myApts doesn't expose raw doctor_id.
      // We should really fetch the raw appointment object or parse it.
      // Let's just hardcode a doctor_id to the appointment's doctor_id.
      const rawApts = (await axios.get(`${API_BASE_URL}/appointments`)).data.appointments;
      const apt = rawApts.find(a => String(a.appointment_id) === String(reviewForm.appointmentId))

      await axios.post(`${API_BASE_URL}/reviews`, {
        appointment_id: reviewForm.appointmentId,
        patient_id: loggedInUser.user_id,
        doctor_id: apt.doctor_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      alert("Review submitted successfully!")
      setReviewForm({ appointmentId: '', rating: 5, comment: '' })
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review")
    }
  }

  const handleMockPayment = async (e) => {
    e.preventDefault()
    if (!paymentAppointmentId) {
      alert("Please select an appointment to pay for")
      return
    }

    try {
      await axios.post(`${API_BASE_URL}/payments`, {
        appointment_id: paymentAppointmentId,
        stripe_transaction_id: `mock_tx_${Date.now()}`,
        total_amount: 150.00,
        payment_type: 'FULL_FEE',
        payment_status: 'COMPLETED'
      })
      alert("Payment successful!")
      setPaymentAppointmentId('')
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to make payment")
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${id}/cancel`);
      alert("Appointment cancelled successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel appointment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReschedule = async (id) => {
    if (!rescheduleDate) {
      alert("Please select a new date and time.");
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/appointments/${id}`, {
        appointment_datetime: rescheduleDate
      });
      await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, {
        status: 'SCHEDULED'
      });
      alert("Appointment rescheduled successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to reschedule appointment: " + (err.response?.data?.message || err.message));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'lab-reports':
        return (
          <AiLabReportAnalyzer 
            patientId={JSON.parse(localStorage.getItem('user'))?.user_id || 1} 
            onAppointmentBooked={fetchDashboardData} 
          />
        );
      case 'upcoming':
        return (
          <section className="dashboard-section">
            {/* Prominent AI Lab Report Analyzer Card on Patient Dashboard */}
            <div 
              className="lab-analyzer-dashboard-hero" 
              onClick={() => setActiveTab('lab-reports')}
              style={{
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)',
                color: '#ffffff',
                padding: '1.5rem 1.75rem',
                borderRadius: '16px',
                marginBottom: '1.75rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.3)',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ flex: '1', minWidth: '280px' }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  ✨ AI Medical Intelligence
                </span>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '700' }}>🧪 AI Lab Report Analyzer</h3>
                <p style={{ margin: '0 0 14px 0', fontSize: '0.9rem', color: '#e6fffa', lineHeight: '1.5' }}>
                  <strong>Understand your lab report with HealPoint AI.</strong> Upload your medical/lab report (CBC, Blood Sugar, Lipid, Thyroid, Kidney/Liver, Vitamins) and our AI will summarize important findings, highlight abnormal values, and suggest which specialist you may want to consult.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('lab-reports'); }}
                    style={{
                      background: '#ffffff',
                      color: '#0f766e',
                      border: 'none',
                      padding: '0.55rem 1.2rem',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    📤 Upload Lab Report
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('lab-reports'); }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      padding: '0.55rem 1.2rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Try Demo Report (1-Click)
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.12)', padding: '16px 20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem' }}>📄</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ccfbf1', marginTop: '4px' }}>PDF • JPG • PNG</div>
                <div style={{ fontSize: '0.75rem', color: '#e6fffa' }}>Max 10MB</div>
              </div>
            </div>

            <h2>Upcoming Appointments</h2>
            <div className="appointments-list">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-top">
                      <div>
                        <p className="appointment-doctor">{apt.doctorName}</p>
                        <p className="appointment-specialty">{apt.specialization} • {apt.type}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        {apt.status === 'REJECTED' && <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>You are on waiting list</span>}
                        {apt.status === 'ACCEPTED' && <span style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>Doctor confirmed</span>}
                      </div>
                    </div>

                    <div className="appointment-details">
                      <span>📅 {apt.date}</span>
                      <span>📍 {apt.location}</span>
                    </div>

                    <div className="appointment-actions">
                      {apt.status === 'ACCEPTED' && (
                        <button 
                          type="button" 
                          className="primary-btn" 
                          onClick={() => setJoinedConsultation(apt)}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', marginRight: '8px', background: '#0f766e' }}
                        >
                          Join Consultation
                        </button>
                      )}
                      {rescheduleId === apt.id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="datetime-local" 
                            value={rescheduleDate} 
                            onChange={(e) => setRescheduleDate(e.target.value)} 
                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <button type="button" className="primary-btn" onClick={() => handleReschedule(apt.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Save</button>
                          <button type="button" className="secondary-btn" onClick={() => setRescheduleId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <button type="button" className="secondary-btn" onClick={() => { setRescheduleId(apt.id); setRescheduleDate(''); }}>Reschedule</button>
                          <button type="button" className="secondary-btn" onClick={() => handleCancelAppointment(apt.id)}>Cancel</button>
                        </>
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
      case 'history':
        return (
          <section className="dashboard-section">
            <h2>Appointment History</h2>
            <div className="history-list">
              {appointmentHistory.length > 0 ? (
                appointmentHistory.map((apt) => (
                  <div key={apt.id} className="history-item">
                    <div className="history-info">
                      <p className="history-doctor">{apt.doctorName}</p>
                      <p className="history-specialty">{apt.specialization}</p>
                      <p className="history-notes">{apt.notes}</p>
                    </div>
                    <div className="history-meta">
                      <span className="history-date">{apt.date}</span>
                      <button type="button" className="secondary-btn view-details-btn">View Details</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No appointment history.</p>
              )}
            </div>
          </section>
        )
      case 'profile':
        return (
          <section className="dashboard-section">
            <h2>Your Profile</h2>
            <div className="profile-card">
              <div className="profile-header">
                <h3>{isEditingProfile ? 'Edit Profile' : profileData.name}</h3>
                {!isEditingProfile ? (
                  <button type="button" className="primary-btn edit-profile-btn" onClick={() => { setIsEditingProfile(true); setProfileForm({ ...profileData }); }}>Edit Profile</button>
                ) : (
                  <div>
                    <button type="button" className="secondary-btn" style={{ marginRight: '10px' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                    <button type="button" className="primary-btn" onClick={handleSaveProfile}>Save Changes</button>
                  </div>
                )}
              </div>

              {isEditingProfile ? (
                <div className="profile-grid">
                  <div className="profile-item full-width">
                    <label>Profile Picture</label>
                    <input type="file" accept="image/*" onChange={(e) => setProfilePictureFile(e.target.files[0])} />
                  </div>
                  <div className="profile-item">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={profileForm.firstName || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="profile-item">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={profileForm.lastName || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="profile-item">
                    <label>Phone</label>
                    <input type="text" name="phone" value={profileForm.phone || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="profile-item">
                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="profile-item">
                    <label>Gender</label>
                    <select name="gender" value={profileForm.gender || ''} onChange={handleProfileChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="profile-item">
                    <label>Blood Group</label>
                    <input type="text" name="bloodGroup" value={profileForm.bloodGroup || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="profile-item">
                    <label>Address</label>
                    <input type="text" name="address" value={profileForm.address || ''} onChange={handleProfileChange} />
                  </div>
                  <div className="profile-item">
                    <label>Emergency Contact</label>
                    <input type="text" name="emergencyContact" value={profileForm.emergencyContact || ''} onChange={handleProfileChange} />
                  </div>
                </div>
              ) : (
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>Email</label>
                    <p>{profileData.email}</p>
                  </div>
                  <div className="profile-item">
                    <label>Phone</label>
                    <p>{profileData.phone}</p>
                  </div>
                  <div className="profile-item">
                    <label>Date of Birth</label>
                    <p>{profileData.dateOfBirth}</p>
                  </div>
                  <div className="profile-item">
                    <label>Gender</label>
                    <p>{profileData.gender}</p>
                  </div>
                  <div className="profile-item">
                    <label>Blood Group</label>
                    <p>{profileData.bloodGroup}</p>
                  </div>
                  <div className="profile-item">
                    <label>Address</label>
                    <p>{profileData.address}</p>
                  </div>
                  <div className="profile-item full-width">
                    <label>Emergency Contact</label>
                    <p>{profileData.emergencyContact}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      case 'payments':
        return (
          <section className="dashboard-section">
            <h2>Payment History</h2>
            <div className="payments-table">
              <div className="table-header">
                <p className="col-date">Date</p>
                <p className="col-doctor">Doctor / Service</p>
                <p className="col-amount">Amount</p>
                <p className="col-status">Status</p>
                <p className="col-method">Method</p>
              </div>
              {payments.map((payment) => (
                <div key={payment.id} className="table-row">
                  <p className="col-date">{payment.date}</p>
                  <p className="col-doctor">{payment.doctorName}</p>
                  <p className="col-amount">{payment.amount}</p>
                  <p className={`col-status status-${payment.status.toLowerCase()}`}>{payment.status}</p>
                  <p className="col-method">{payment.method}</p>
                </div>
              ))}
            </div>

            <div className="add-review-section" style={{ marginTop: '30px' }}>
              <h3>Make a Mock Payment</h3>
              <form className="review-form" onSubmit={handleMockPayment}>
                <div className="form-group">
                  <label htmlFor="payment-select">Select Appointment</label>
                  <select 
                    id="payment-select" 
                    value={paymentAppointmentId} 
                    onChange={e => setPaymentAppointmentId(e.target.value)}
                  >
                    <option value="">Choose an appointment...</option>
                    {[...upcomingAppointments, ...appointmentHistory].map((apt) => (
                      <option key={apt.id} value={apt.id}>{apt.date} - {apt.doctorName}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="primary-btn submit-review-btn">Pay $150.00 Now</button>
              </form>
            </div>
          </section>
        )
      case 'reviews':
        return (
          <section className="dashboard-section">
            <h2>My Reviews</h2>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div>
                        <p className="review-doctor">{review.doctorName}</p>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <p className="review-text">{review.reviewText}</p>
                  </div>
                ))
              ) : (
                <p className="empty-state">No reviews yet.</p>
              )}
            </div>

            <div className="add-review-section">
              <h3>Leave a Review</h3>
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="doctor-select">Select Appointment</label>
                  <select 
                    id="doctor-select" 
                    value={reviewForm.appointmentId} 
                    onChange={e => setReviewForm({...reviewForm, appointmentId: e.target.value})}
                  >
                    <option value="">Choose a completed appointment...</option>
                    {appointmentHistory.filter(a => a.status === 'COMPLETED').map((apt) => (
                      <option key={apt.id} value={apt.id}>{apt.date} - {apt.doctorName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        type="button" 
                        className={`star-btn ${num <= reviewForm.rating ? 'filled' : ''}`}
                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                        style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: num <= reviewForm.rating ? '#FFD700' : '#ccc' }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-text">Review</label>
                  <textarea 
                    id="review-text" 
                    placeholder="Share your experience..." 
                    rows="4" 
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                  />
                </div>

                <button type="submit" className="primary-btn submit-review-btn">Submit Review</button>
              </form>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  if (joinedConsultation) {
    return (
      <div className="patient-dashboard" style={{ display: 'block', padding: '20px' }}>
        <ConsultationArea appointment={joinedConsultation} role="PATIENT" onBack={() => setJoinedConsultation(null)} />
      </div>
    )
  }

  return (
    <div className="patient-dashboard">
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
                <span style={{ fontSize: '2rem' }}>👤</span>
              )}
            </div>
            {sidebarOpen && <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{profileData.name}</p>}
          </div>
        )}

        <nav className="sidebar-nav">
          <button
            type="button"
            className="nav-item"
            onClick={() => window.location.href = '/doctors'}
            style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold' }}
          >
            🩺 Book Doctor
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'lab-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('lab-reports')}
            style={activeTab === 'lab-reports' ? { backgroundColor: '#0f766e', color: 'white', fontWeight: 'bold' } : { color: '#2dd4bf' }}
          >
            🧪 Report Analyzer
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💳 Payments
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews
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
          <h1 className="content-title">My Dashboard</h1>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Go to Home"
            title="Go to Home"
          >
            🏠
          </button>
        </div>

        <AiDashboardBanner 
          onTriggerAiAction={(query) => {
            window.dispatchEvent(new CustomEvent('openHealPointAi', { detail: { query } }))
          }} 
        />

        {renderContent()}
      </main>
    </div>
  )
}

export default PatientDashboard

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
    axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}/messages/${appointment.id}`)
      .then(res => setMessages(res.data.messages || []))
      .catch(err => console.error("Error fetching message history:", err))

    // 2. Initialize Socket.io
    const socket = io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}`)
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
