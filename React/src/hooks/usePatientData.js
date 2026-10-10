import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { SAMPLE_DOCTORS } from '../../../AI/index.js'

// Helper to resolve registered doctor information
export const resolveDoctorInfo = (docId, doctorsMap = {}) => {
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

export const usePatientData = (navigate) => {
  const [profileData, setProfileData] = useState(defaultProfile)
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  const fetchDashboardData = useCallback(async () => {
    let loggedInUser = null
    try {
      const userStr = localStorage.getItem('user')
      loggedInUser = userStr ? JSON.parse(userStr) : null
    } catch (e) {
      loggedInUser = null
    }

    if (!loggedInUser) {
      if (navigate) navigate('/login')
      else window.location.href = '/login'
      return
    }

    if (loggedInUser.role === 'DOCTOR') {
      if (navigate) navigate('/doctor-dashboard')
      else window.location.href = '/doctor-dashboard'
      return
    }

    if (loggedInUser.role === 'ADMIN') {
      if (navigate) navigate('/admin/dashboard')
      else window.location.href = '/admin/dashboard'
      return
    }

    const patientId = loggedInUser.user_id || 1

    try {
      setLoading(true)
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, navigate])

  const handleSaveProfile = async (profileForm, profilePictureFile) => {
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
      
      setProfileData(prev => ({ 
        ...prev, 
        ...profileForm, 
        name: `${profileForm.firstName} ${profileForm.lastName}` 
      }))
      fetchDashboardData()
      alert("Profile updated successfully!")
    } catch (err) {
      alert("Failed to update profile")
      console.error(err)
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${id}/cancel`)
      alert("Appointment cancelled successfully!")
      fetchDashboardData()
    } catch (err) {
      alert("Failed to cancel appointment: " + (err.response?.data?.message || err.message))
    }
  }

  const handleReschedule = async (id, newDate) => {
    try {
      await axios.put(`${API_BASE_URL}/appointments/${id}`, {
        appointment_datetime: newDate
      })
      await axios.patch(`${API_BASE_URL}/appointments/${id}/status`, {
        status: 'SCHEDULED'
      })
      alert("Appointment rescheduled successfully!")
      fetchDashboardData()
    } catch (err) {
      alert("Failed to reschedule appointment: " + (err.response?.data?.message || err.message))
    }
  }

  const handleMakePayment = async (appointmentId) => {
    try {
      await axios.post(`${API_BASE_URL}/payments`, {
        appointment_id: appointmentId,
        stripe_transaction_id: `mock_tx_${Date.now()}`,
        total_amount: 150.00,
        payment_type: 'FULL_FEE',
        payment_status: 'COMPLETED'
      })
      alert("Payment successful!")
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to make payment")
    }
  }

  const handleSubmitReview = async (reviewForm) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'))
      const rawApts = (await axios.get(`${API_BASE_URL}/appointments`)).data.appointments
      const apt = rawApts.find(a => String(a.appointment_id) === String(reviewForm.appointmentId))

      await axios.post(`${API_BASE_URL}/reviews`, {
        appointment_id: reviewForm.appointmentId,
        patient_id: loggedInUser.user_id,
        doctor_id: apt ? apt.doctor_id : 104,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      alert("Review submitted successfully!")
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review")
    }
  }

  const handlePostVisitReview = (newReview) => {
    setReviews(prev => [newReview, ...prev])
  }

  return {
    profileData,
    upcomingAppointments,
    appointmentHistory,
    payments,
    reviews,
    loading,
    error,
    API_BASE_URL,
    fetchDashboardData,
    handleSaveProfile,
    handleCancelAppointment,
    handleReschedule,
    handleMakePayment,
    handleSubmitReview,
    handlePostVisitReview
  }
}
