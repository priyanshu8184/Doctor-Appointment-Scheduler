import React, { useState, useEffect, useRef } from 'react'
import './PatientDashboard.css'
import axios from 'axios'
import { io } from 'socket.io-client'
import Peer from 'peerjs'
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
  Home, 
  Clock, 
  MapPin, 
  Video, 
  Building, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  UploadCloud, 
  ArrowLeft, 
  PhoneCall, 
  PhoneOff, 
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react'
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
    if (navigate) navigate('/login')
    else window.location.href = '/login'
  }

  // Parse URL search parameters for default active tab
  const queryParams = new URLSearchParams(window.location.search)
  const initialTab = queryParams.get('tab') || 'upcoming'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile drawer state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageError, setImageError] = useState(false)

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

  // Post-visit doctor rating states
  const [ratingModalApt, setRatingModalApt] = useState(null)
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: '' })
  const [ratingHover, setRatingHover] = useState(0)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState('')

  const getRatingLabel = (score) => {
    switch (score) {
      case 5: return '5 ★ - Excellent experience, highly recommend!'
      case 4: return '4 ★ - Very good consultation'
      case 3: return '3 ★ - Average / Satisfactory'
      case 2: return '2 ★ - Below expectations'
      case 1: return '1 ★ - Unsatisfactory visit'
      default: return 'Select star rating'
    }
  }

  const handleOpenRatingModal = (apt) => {
    setRatingModalApt(apt)
    setRatingForm({ rating: 5, comment: '' })
    setRatingHover(0)
    setRatingSuccessMsg('')
  }

  const handlePostVisitRatingSubmit = async (e) => {
    e?.preventDefault()
    if (!ratingModalApt) return
    setRatingSubmitting(true)
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user')) || { user_id: 1 }
      const payload = {
        appointment_id: ratingModalApt.id,
        patient_id: loggedInUser.user_id,
        doctor_id: ratingModalApt.doctor_id || 104,
        rating: ratingForm.rating,
        comment: ratingForm.comment || 'Helpful and professional doctor consultation.'
      }

      try {
        await axios.post(`${API_BASE_URL}/reviews`, payload)
      } catch (err) {
        console.warn('Backend review submission fallback:', err.message)
      }

      const newReview = {
        id: Date.now(),
        appointment_id: ratingModalApt.id,
        doctorName: ratingModalApt.doctorName,
        rating: ratingForm.rating,
        date: new Date().toLocaleDateString(),
        reviewText: ratingForm.comment || 'Helpful and professional doctor consultation.'
      }

      setReviews(prev => [newReview, ...prev])
      setRatingSuccessMsg(`Thank you! Your ${ratingForm.rating}-star review for ${ratingModalApt.doctorName} has been recorded.`)
      setTimeout(() => {
        setRatingModalApt(null)
        setRatingSuccessMsg('')
      }, 2000)
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Failed to submit review')
    } finally {
      setRatingSubmitting(false)
    }
  }

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  const fetchDashboardData = async () => {
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
        console.warn('Doctors directory fetch fallback:', docErr.message)
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
      
      setProfileData({ ...profileData, ...profileForm, name: `${profileForm.firstName} ${profileForm.lastName}` })
      setIsEditingProfile(false)
      fetchDashboardData()
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
      const rawApts = (await axios.get(`${API_BASE_URL}/appointments`)).data.appointments;
      const apt = rawApts.find(a => String(a.appointment_id) === String(reviewForm.appointmentId))

      await axios.post(`${API_BASE_URL}/reviews`, {
        appointment_id: reviewForm.appointmentId,
        patient_id: loggedInUser.user_id,
        doctor_id: apt ? apt.doctor_id : 104,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      alert("Review submitted successfully!")
      setReviewForm({ appointmentId: '', rating: 5, comment: '' })
      fetchDashboardData()
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
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to make payment")
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${id}/cancel`);
      alert("Appointment cancelled successfully!");
      fetchDashboardData();
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
      setRescheduleId(null);
      setRescheduleDate('');
      fetchDashboardData();
    } catch (err) {
      alert("Failed to reschedule appointment: " + (err.response?.data?.message || err.message));
    }
  };

  // Extract initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return 'P'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const nextAppointment = upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

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
          <div className="dashboard-view-stack">
            {/* 1. Next Appointment Highlight Card (when available) */}
            {nextAppointment && (
              <div className="next-appointment-hero">
                <div className="next-apt-header">
                  <div className="next-apt-badge">
                    <Clock size={13} />
                    <span>Next Upcoming Appointment</span>
                  </div>
                  <span className={`appointment-status ${nextAppointment.status.toLowerCase()}`}>
                    {nextAppointment.status}
                  </span>
                </div>
                <div className="next-apt-body">
                  <div className="next-apt-doc-block">
                    <div className="next-apt-avatar">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h3 className="next-apt-doctor">{nextAppointment.doctorName}</h3>
                      <p className="next-apt-spec">{nextAppointment.specialization}</p>
                    </div>
                  </div>
                  <div className="next-apt-meta-grid">
                    <div className="meta-pill">
                      <Calendar size={14} />
                      <span>{nextAppointment.date}</span>
                    </div>
                    <div className="meta-pill">
                      <Clock size={14} />
                      <span>{nextAppointment.time}</span>
                    </div>
                    <div className="meta-pill">
                      {nextAppointment.type === 'VIDEO' ? <Video size={14} /> : <Building size={14} />}
                      <span>{nextAppointment.type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Clinic'}</span>
                    </div>
                    <div className="meta-pill">
                      <MapPin size={14} />
                      <span>{nextAppointment.location}</span>
                    </div>
                  </div>
                </div>
                <div className="next-apt-actions">
                  {nextAppointment.status === 'ACCEPTED' && (
                    <button 
                      type="button" 
                      className="primary-btn join-btn"
                      onClick={() => setJoinedConsultation(nextAppointment)}
                    >
                      <Video size={15} />
                      <span>Join Video Consultation</span>
                    </button>
                  )}
                  {rescheduleId === nextAppointment.id ? (
                    <div className="inline-reschedule-form">
                      <input 
                        type="datetime-local" 
                        value={rescheduleDate} 
                        onChange={(e) => setRescheduleDate(e.target.value)} 
                      />
                      <button type="button" className="primary-btn sm" onClick={() => handleReschedule(nextAppointment.id)}>Save</button>
                      <button type="button" className="secondary-btn sm" onClick={() => setRescheduleId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="secondary-btn" 
                        onClick={() => { setRescheduleId(nextAppointment.id); setRescheduleDate(''); }}
                      >
                        Reschedule
                      </button>
                      <button 
                        type="button" 
                        className="secondary-btn danger-hover" 
                        onClick={() => handleCancelAppointment(nextAppointment.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 2. Prominent AI Lab Report Analyzer Card */}
            <div 
              className="lab-analyzer-feature-card" 
              onClick={() => setActiveTab('lab-reports')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('lab-reports'); }}
              aria-label="Open AI Lab Report Analyzer"
            >
              <div className="feature-card-content">
                <div className="feature-badge">
                  <FileText size={13} />
                  <span>Clinical Diagnostics</span>
                </div>
                <h3 className="feature-title">AI Lab Report Analyzer</h3>
                <p className="feature-description">
                  Upload blood work, lipid panels, thyroid tests, or metabolic reports to extract biomarker values, identify abnormal findings, and match with relevant clinical specialists.
                </p>
                <div className="feature-actions">
                  <button 
                    type="button" 
                    className="feature-btn primary"
                    onClick={(e) => { e.stopPropagation(); setActiveTab('lab-reports'); }}
                  >
                    <UploadCloud size={15} />
                    <span>Upload Lab Report</span>
                  </button>
                  <button 
                    type="button" 
                    className="feature-btn secondary"
                    onClick={(e) => { e.stopPropagation(); setActiveTab('lab-reports'); }}
                  >
                    <span>Try Demo Report</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="feature-format-card">
                <FileText size={28} className="format-icon" />
                <span className="format-title">PDF • JPG • PNG</span>
                <span className="format-limit">Max 10MB</span>
              </div>
            </div>

            {/* 3. Upcoming Appointments Section */}
            <section className="dashboard-section">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <Calendar size={18} className="section-icon" />
                  <h2>Upcoming Appointments</h2>
                </div>
                <button 
                  type="button" 
                  className="section-link-btn"
                  onClick={() => { if (navigate) navigate('/doctors'); else window.location.href = '/doctors'; }}
                >
                  <span>Book New Appointment</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="appointments-list">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="appointment-card">
                      <div className="appointment-top">
                        <div className="appointment-doctor-group">
                          <p className="appointment-doctor">{apt.doctorName}</p>
                          <p className="appointment-specialty">{apt.specialization} • {apt.type === 'VIDEO' ? 'Video' : 'In-Person'}</p>
                        </div>
                        <div className="appointment-status-wrap">
                          <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                          {apt.status === 'REJECTED' && <span className="status-note danger">On waiting list</span>}
                          {apt.status === 'ACCEPTED' && <span className="status-note success">Doctor confirmed</span>}
                        </div>
                      </div>

                      <div className="appointment-details">
                        <span className="detail-item">
                          <Calendar size={14} />
                          <span>{apt.date} at {apt.time}</span>
                        </span>
                        <span className="detail-item">
                          <MapPin size={14} />
                          <span>{apt.location}</span>
                        </span>
                      </div>

                      <div className="appointment-actions">
                        {apt.status === 'ACCEPTED' && (
                          <button 
                            type="button" 
                            className="primary-btn join-btn" 
                            onClick={() => setJoinedConsultation(apt)}
                          >
                            <Video size={14} />
                            <span>Join Consultation</span>
                          </button>
                        )}
                        {rescheduleId === apt.id ? (
                          <div className="inline-reschedule-form">
                            <input 
                              type="datetime-local" 
                              value={rescheduleDate} 
                              onChange={(e) => setRescheduleDate(e.target.value)} 
                            />
                            <button type="button" className="primary-btn sm" onClick={() => handleReschedule(apt.id)}>Save</button>
                            <button type="button" className="secondary-btn sm" onClick={() => setRescheduleId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <button 
                              type="button" 
                              className="secondary-btn" 
                              onClick={() => { setRescheduleId(apt.id); setRescheduleDate(''); }}
                            >
                              Reschedule
                            </button>
                            <button 
                              type="button" 
                              className="secondary-btn danger-hover" 
                              onClick={() => handleCancelAppointment(apt.id)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Calendar size={32} className="empty-state-icon" />
                    <h4>No upcoming appointments</h4>
                    <p>Schedule a video or in-person consultation with our certified doctors.</p>
                    <button 
                      type="button" 
                      className="primary-btn" 
                      onClick={() => { if (navigate) navigate('/doctors'); else window.location.href = '/doctors'; }}
                    >
                      Find a Doctor
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )
      case 'history':
        return (
          <section className="dashboard-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <HistoryIcon size={18} className="section-icon" />
                <h2>Appointment History</h2>
              </div>
            </div>
            <div className="history-list">
              {appointmentHistory.length > 0 ? (
                appointmentHistory.map((apt) => {
                  const existingReview = reviews.find(r => 
                    String(r.appointment_id) === String(apt.id) || 
                    (r.doctorName === apt.doctorName && (r.date === apt.date || String(apt.date).includes(String(r.date))))
                  );

                  return (
                    <div key={apt.id} className="history-item">
                      <div className="history-info">
                        <div className="history-title-row">
                          <p className="history-doctor">{apt.doctorName}</p>
                          {existingReview ? (
                            <span className="history-rating-badge">
                              <Star size={12} className="star-icon filled" />
                              <span>Rated {existingReview.rating}/5</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="rate-doc-btn"
                              onClick={() => handleOpenRatingModal(apt)}
                              aria-label={`Rate ${apt.doctorName}`}
                            >
                              <Star size={13} className="star-icon" />
                              <span>Rate Doctor</span>
                            </button>
                          )}
                        </div>
                        <p className="history-specialty">{apt.specialization} • {apt.type === 'VIDEO' ? 'Video' : 'In-Person'}</p>
                        {apt.notes && <p className="history-notes">{apt.notes}</p>}
                        {existingReview && existingReview.reviewText && (
                          <p className="history-review-feedback">
                            <strong>Your review:</strong> "{existingReview.reviewText}"
                          </p>
                        )}
                      </div>
                      <div className="history-meta">
                        <span className="history-date">
                          <Calendar size={13} />
                          <span>{apt.date}</span>
                        </span>
                        <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <HistoryIcon size={32} className="empty-state-icon" />
                  <h4>No appointment history</h4>
                  <p>Your completed consultations and clinical records will appear here.</p>
                </div>
              )}
            </div>
          </section>
        )
      case 'profile':
        return (
          <section className="dashboard-section">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-title-group">
                  <User size={20} className="section-icon" />
                  <h3>{isEditingProfile ? 'Edit Profile Details' : profileData.name}</h3>
                </div>
                {!isEditingProfile ? (
                  <button 
                    type="button" 
                    className="primary-btn edit-profile-btn" 
                    onClick={() => { setIsEditingProfile(true); setProfileForm({ ...profileData }); }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="profile-header-actions">
                    <button type="button" className="secondary-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
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
                    <label>Phone Number</label>
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
                    <label>Email Address</label>
                    <p>{profileData.email}</p>
                  </div>
                  <div className="profile-item">
                    <label>Phone Number</label>
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
                    <label>Home Address</label>
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
            <div className="section-header-row">
              <div className="section-title-wrap">
                <CreditCard size={18} className="section-icon" />
                <h2>Payment History</h2>
              </div>
            </div>
            <div className="payments-table-container">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Doctor / Service</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="col-date">{payment.date}</td>
                      <td className="col-doctor">{payment.doctorName}</td>
                      <td className="col-amount">{payment.amount}</td>
                      <td>
                        <span className={`status-pill status-${payment.status.toLowerCase()}`}>{payment.status}</span>
                      </td>
                      <td className="col-method">{payment.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="add-payment-section">
              <h3>Make a Mock Payment</h3>
              <form className="payment-form" onSubmit={handleMockPayment}>
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
                <button type="submit" className="primary-btn">Pay $150.00 Now</button>
              </form>
            </div>
          </section>
        )
      case 'reviews':
        return (
          <section className="dashboard-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <Star size={18} className="section-icon" />
                <h2>Doctor Consultations & Ratings</h2>
              </div>
            </div>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div>
                        <p className="review-doctor">{review.doctorName}</p>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < review.rating ? 'star filled' : 'star'} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <p className="review-text">{review.reviewText}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Star size={32} className="empty-state-icon" />
                  <h4>No reviews submitted yet</h4>
                  <p>Leave feedback for your past consultations to help improve clinical service.</p>
                </div>
              )}
            </div>

            <div className="add-review-section">
              <h3>Rate a Doctor / Completed Visit</h3>
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="doctor-select">Select Completed Appointment</label>
                  <select 
                    id="doctor-select" 
                    value={reviewForm.appointmentId} 
                    onChange={e => setReviewForm({...reviewForm, appointmentId: e.target.value})}
                  >
                    <option value="">Choose a completed appointment...</option>
                    {appointmentHistory.map((apt) => (
                      <option key={apt.id} value={apt.id}>{apt.date} - {apt.doctorName} ({apt.specialization})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating Score</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        type="button" 
                        className={`star-btn ${num <= reviewForm.rating ? 'filled' : ''}`}
                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                        aria-label={`Rate ${num} stars`}
                      >
                        <Star size={20} className={num <= reviewForm.rating ? 'star-filled' : 'star-empty'} />
                      </button>
                    ))}
                  </div>
                  <span className="rating-label-hint">{getRatingLabel(reviewForm.rating)}</span>
                </div>

                <div className="form-group">
                  <label htmlFor="review-text">Review Comments</label>
                  <textarea 
                    id="review-text" 
                    placeholder="Share your experience regarding the consultation, doctor attentiveness, and diagnosis..." 
                    rows="3" 
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                  />
                </div>

                <button type="submit" className="primary-btn submit-review-btn">
                  <Star size={15} />
                  <span>Submit Review</span>
                </button>
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
        <ConsultationArea 
          appointment={joinedConsultation} 
          role="PATIENT" 
          onBack={() => setJoinedConsultation(null)}
          onRateDoctor={(apt) => {
            setJoinedConsultation(null);
            handleOpenRatingModal(apt);
          }}
        />
      </div>
    )
  }

  const patientFirstName = profileData?.firstName || profileData?.name?.split(' ')[0] || 'Patient';

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
              setSidebarOpen(false);
              if (navigate) navigate('/doctors');
              else window.location.href = '/doctors';
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
        <div className="rating-modal-overlay" onClick={() => !ratingSubmitting && setRatingModalApt(null)}>
          <div className="rating-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="rating-modal-title">
            <div className="rating-modal-header">
              <div className="rating-header-left">
                <div className="rating-star-circle">
                  <Star size={20} className="star-icon-header" />
                </div>
                <div>
                  <h3 id="rating-modal-title" className="rating-modal-title">Rate Your Visit</h3>
                  <p className="rating-modal-subtitle">Consultation with {ratingModalApt.doctorName}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="rating-modal-close" 
                onClick={() => setRatingModalApt(null)}
                disabled={ratingSubmitting}
                aria-label="Close rating modal"
              >
                <X size={18} />
              </button>
            </div>

            {ratingSuccessMsg ? (
              <div className="rating-success-box">
                <CheckCircle2 size={36} className="success-icon" />
                <h4>Thank You For Your Feedback!</h4>
                <p>{ratingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePostVisitRatingSubmit} className="rating-modal-form">
                <div className="rating-field-group">
                  <label className="rating-field-label">How was your clinical consultation?</label>
                  <div className="interactive-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn-lg ${(ratingHover || ratingForm.rating) >= star ? 'active' : ''}`}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star 
                          size={28} 
                          fill={(ratingHover || ratingForm.rating) >= star ? '#F59E0B' : 'transparent'} 
                          stroke={(ratingHover || ratingForm.rating) >= star ? '#D97706' : '#94A3B8'} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="rating-feedback-label">
                    {getRatingLabel(ratingHover || ratingForm.rating)}
                  </span>
                </div>

                <div className="rating-field-group">
                  <label htmlFor="rating-comments" className="rating-field-label">
                    Comments / Feedback (Optional)
                  </label>
                  <textarea
                    id="rating-comments"
                    rows="3"
                    className="rating-textarea"
                    placeholder="Share specific details about doctor communication, diagnosis, clarity, and overall care..."
                    value={ratingForm.comment}
                    onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                  />
                </div>

                <div className="rating-modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setRatingModalApt(null)}
                    disabled={ratingSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-btn submit-rating-btn"
                    disabled={ratingSubmitting}
                  >
                    {ratingSubmitting ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Star size={15} />
                        <span>Submit Rating</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientDashboard

const ConsultationArea = ({ appointment, role, onBack, onRateDoctor }) => {
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
    <div className="consultation-area-container">
      {/* Header */}
      <div className="consultation-header">
        <div className="header-left">
          <button onClick={onBack} className="back-btn" aria-label="Return to Dashboard">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div className="consultation-title-wrap">
            <span className="doc-name">Consultation with {role === 'DOCTOR' ? appointment.patientName : appointment.doctorName}</span>
            <span className="type-badge">{appointment.type}</span>
          </div>
        </div>
        <div className="consultation-header-actions">
          {role === 'PATIENT' && onRateDoctor && (
            <button 
              type="button" 
              className="rate-doc-header-btn"
              onClick={() => onRateDoctor(appointment)}
              title="Rate doctor consultation"
            >
              <Star size={14} className="star-icon filled" />
              <span>Rate Doctor</span>
            </button>
          )}
          {appointment.type !== 'MESSAGING' && (
            <span className="call-status-tag">Status: <strong>{callStatus}</strong></span>
          )}
        </div>
      </div>

      {/* Main body */}
      <div className="consultation-body">
        {/* Media Pane */}
        {appointment.type !== 'MESSAGING' && (
          <div className="media-pane">
            {appointment.type === 'VIDEO' ? (
              <div className="video-streams-wrap">
                {/* Remote Stream */}
                <div className="remote-stream-box">
                  <video ref={remoteVideoRef} autoPlay playsInline />
                  <span className="stream-label">
                    {role === 'DOCTOR' ? 'Patient' : 'Doctor'}
                  </span>
                </div>
                {/* Local Stream */}
                <div className="local-stream-box">
                  <video ref={localVideoRef} autoPlay playsInline muted />
                  <span className="stream-label">You</span>
                </div>
              </div>
            ) : (
              <div className="audio-call-box">
                <PhoneCall size={48} className="audio-icon" />
                <h3>Audio Consultation</h3>
                <audio ref={remoteAudioRef} autoPlay />
                <audio ref={localAudioRef} autoPlay muted />
              </div>
            )}

            {/* Media Controls */}
            <div className="media-controls-row">
              {!activeCall ? (
                <>
                  <button onClick={handleStartCall} className="primary-btn call-connect-btn">
                    <PhoneCall size={16} />
                    <span>Connect Call</span>
                  </button>
                  {role === 'PATIENT' && onRateDoctor && callStatus === 'Call ended' && (
                    <button 
                      type="button" 
                      onClick={() => onRateDoctor(appointment)} 
                      className="primary-btn rate-post-call-btn"
                    >
                      <Star size={15} />
                      <span>Rate Dr. {appointment.doctorName}</span>
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleEndCall} className="disconnect-btn">
                  <PhoneOff size={16} />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat Pane */}
        <div className="chat-pane">
          <div className="chat-pane-header">Clinical Chat Messages</div>
          
          {/* Messages list */}
          <div className="messages-list">
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === user.user_id;
              return (
                <div key={idx} className={`msg-item ${isMe ? 'mine' : 'theirs'}`}>
                  <div className="msg-sender">
                    {isMe ? 'You' : msg.User?.email || msg.sender_role}
                  </div>
                  <div className="msg-bubble">
                    {msg.message_text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              placeholder="Type message to doctor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="primary-btn sm" aria-label="Send message">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
