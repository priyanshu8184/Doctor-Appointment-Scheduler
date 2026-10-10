import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export const useDoctorData = (navigate) => {
  const [todayAppointments, setTodayAppointments] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [patients, setPatients] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
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

    if (!loggedInUser || loggedInUser.role !== 'DOCTOR') {
      if (navigate) {
        navigate(loggedInUser ? '/patient-dashboard' : '/login')
      } else {
        window.location.href = loggedInUser ? '/patient-dashboard' : '/login'
      }
      return
    }

    const doctorId = loggedInUser.user_id || 101

    // Default fallback doctor profile data
    const doctorFirstName = loggedInUser.first_name || (loggedInUser.name ? loggedInUser.name.split(' ')[0] : 'Rahul')
    const doctorLastName = loggedInUser.last_name || (loggedInUser.name ? loggedInUser.name.split(' ')[1] : 'Sharma')
    const displayName = `Dr. ${doctorFirstName.replace(/^dr\.?\s*/i, '')} ${doctorLastName || ''}`.trim()

    const fallbackProfile = {
      name: displayName,
      specialization: loggedInUser.specialization || 'General Medicine & Dermatology',
      experience: loggedInUser.experience_years ? `${loggedInUser.experience_years} years` : '10+ years',
      education: loggedInUser.qualifications || 'MBBS, MD',
      clinic: loggedInUser.location || 'HealPoint Health Clinic, Room 302',
      phone: loggedInUser.phone_number || '+1 (555) 019-3482',
      email: loggedInUser.email || 'doctor@healpoint.com',
      bio: loggedInUser.bio || 'Board-certified medical specialist dedicated to patient wellness and evidence-based clinical care.',
      profilePicture: null,
      certificate: null
    }

    const fallbackTodayApts = [
      {
        id: 101,
        patientName: 'Demo Patient (Alex Morgan)',
        type: 'VIDEO',
        date: new Date().toISOString(),
        time: '10:30 AM',
        status: 'SCHEDULED'
      },
      {
        id: 102,
        patientName: 'Sarah Jenkins',
        type: 'IN_PERSON',
        date: new Date().toISOString(),
        time: '02:00 PM',
        status: 'ACCEPTED'
      }
    ]

    const fallbackUpcomingApts = [
      {
        id: 103,
        patientName: 'Michael Chen',
        type: 'VIDEO',
        date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        time: '11:15 AM',
        status: 'SCHEDULED'
      },
      {
        id: 104,
        patientName: 'Emily Davis',
        type: 'IN_PERSON',
        date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        time: '03:45 PM',
        status: 'SCHEDULED'
      }
    ]

    const fallbackAvailability = [
      { id: 1, day: 'Every MONDAY', slots: '09:00 - 17:00', is_available: true },
      { id: 2, day: 'Every WEDNESDAY', slots: '09:00 - 17:00', is_available: true },
      { id: 3, day: 'Every FRIDAY', slots: '10:00 - 16:00', is_available: true },
      { id: 4, day: 'Every SATURDAY', slots: 'Unavailable (Blocked)', is_available: false }
    ]

    const fallbackPatients = [
      { id: 1, name: 'Alex Morgan', visits: 3, lastVisit: 'Today' },
      { id: 2, name: 'Sarah Jenkins', visits: 2, lastVisit: 'Yesterday' },
      { id: 3, name: 'Michael Chen', visits: 4, lastVisit: '1 week ago' },
      { id: 4, name: 'Emily Davis', visits: 1, lastVisit: '2 weeks ago' }
    ]

    // Set initial fallback state immediately for instant render
    setProfileData(fallbackProfile)
    setTodayAppointments(fallbackTodayApts)
    setUpcomingAppointments(fallbackUpcomingApts)
    setAvailabilitySlots(fallbackAvailability)
    setPatients(fallbackPatients)
    setLoading(false)

    try {
      // A. Fetch Doctor Profile details
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`)
        const dbDoctor = profileRes.data.doctor || {}
        if (dbDoctor && (dbDoctor.first_name || dbDoctor.name)) {
          setProfileData({
            name: dbDoctor.name || `Dr. ${dbDoctor.first_name} ${dbDoctor.last_name}`,
            specialization: dbDoctor.specialization || dbDoctor.specialty || fallbackProfile.specialization,
            experience: dbDoctor.experience || fallbackProfile.experience,
            education: dbDoctor.education || dbDoctor.qualifications || fallbackProfile.education,
            clinic: dbDoctor.location || fallbackProfile.clinic,
            phone: dbDoctor.phone_number || fallbackProfile.phone,
            email: loggedInUser.email,
            bio: dbDoctor.bio || fallbackProfile.bio,
            profilePicture: dbDoctor.profile_picture ? `${API_BASE_URL.replace('/api', '')}${dbDoctor.profile_picture}` : null,
            certificate: dbDoctor.certificate ? `${API_BASE_URL.replace('/api', '')}${dbDoctor.certificate}` : null
          })
        }
      } catch (err) {
        console.warn('Doctor profile API fallback:', err.message)
      }

      // B. Fetch Appointments for this doctor
      try {
        const appointmentsRes = await axios.get(`${API_BASE_URL}/appointments`)
        const allAppointments = appointmentsRes.data.appointments || []
        
        const myApts = allAppointments
          .filter(a => a.doctor_id === doctorId || a.doctor_name?.toLowerCase().includes(doctorFirstName.toLowerCase()))
          .map(apt => ({
            id: apt.appointment_id || apt.id,
            patientName: apt.patient_name || `Patient #${apt.patient_id}`,
            type: apt.appointment_type || 'VIDEO',
            date: apt.appointment_datetime || new Date().toISOString(),
            time: apt.appointment_datetime ? new Date(apt.appointment_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '10:00 AM',
            status: apt.status || 'SCHEDULED'
          }))

        if (myApts.length > 0) {
          const today = new Date().toDateString()
          setTodayAppointments(myApts.filter(apt => new Date(apt.date).toDateString() === today))
          setUpcomingAppointments(myApts.filter(apt => new Date(apt.date).toDateString() !== today))
        }
      } catch (err) {
        console.warn('Doctor appointments API fallback:', err.message)
      }

      // C. Fetch Availability Slots
      try {
        const availabilityRes = await axios.get(`${API_BASE_URL}/doctor-availability/doctor/${doctorId}`)
        const availabilityArray = availabilityRes.data.availability || []
        if (availabilityArray.length > 0) {
          setAvailabilitySlots(availabilityArray.map(slot => ({
            id: slot.availability_id,
            day: slot.specific_date ? `Date: ${slot.specific_date}` : `Every ${slot.day_of_week}`,
            slots: slot.is_available ? `${slot.start_time} - ${slot.end_time}` : 'Unavailable (Blocked)',
            is_available: slot.is_available
          })))
        }
      } catch (err) {
        console.warn('Doctor availability API fallback:', err.message)
      }

    } catch (err) {
      console.warn('Dashboard data fetch finished with fallback:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, navigate])

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, { status })
      setTodayAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status } : apt))
      setUpcomingAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status } : apt))
    } catch (err) {
      alert("Failed to update appointment: " + (err.response?.data?.message || err.message))
    }
  }

  const handleSaveProfile = async (profileForm, profilePictureFile, certificateFile) => {
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
      fetchDashboardData()
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message))
    }
  }

  const handleAddAvailability = async (formData) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'))
      const payload = {
        doctor_id: loggedInUser.user_id,
        is_available: formData.availFormStatus === 'AVAILABLE'
      }

      if (formData.availFormType === 'RECURRING') {
        payload.day_of_week = formData.availFormDay
      } else {
        payload.specific_date = formData.availFormDate
      }

      if (payload.is_available) {
        payload.start_time = formData.availFormStart
        payload.end_time = formData.availFormEnd
      }

      await axios.post(`${API_BASE_URL}/doctor-availability`, payload)
      alert("Availability added successfully!")
      fetchDashboardData()
    } catch (err) {
      alert("Failed to add availability: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm("Are you sure you want to delete this availability rule?")) return
    try {
      await axios.delete(`${API_BASE_URL}/doctor-availability/${id}`)
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id))
    } catch (err) {
      alert("Failed to delete availability: " + (err.response?.data?.message || err.message))
    }
  }

  return {
    todayAppointments,
    upcomingAppointments,
    availabilitySlots,
    patients,
    profileData,
    loading,
    error,
    API_BASE_URL,
    fetchDashboardData,
    handleUpdateAppointmentStatus,
    handleSaveProfile,
    handleAddAvailability,
    handleDeleteAvailability
  }
}
