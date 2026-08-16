import React, { useMemo, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './DoctorListingPage.css'
import axios from 'axios'

const DoctorListingPage = ({ navigate }) => {
  const [doctorsList, setDoctorsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const queryParams = new URLSearchParams(window.location.search)
  const initialSearch = queryParams.get('search') || ''
  const initialLocation = queryParams.get('location') || 'All'
  const initialAvailability = queryParams.get('availability') || 'All'
  const initialSpecialization = queryParams.get('specialization') || 'All'

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentType, setAppointmentType] = useState('VIDEO')
  const [bookingStatus, setBookingStatus] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpecialization)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [selectedAvailability, setSelectedAvailability] = useState(initialAvailability)
  
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isDoctor = user?.role === 'DOCTOR'
  
  const [activeFilters, setActiveFilters] = useState({
    search: initialSearch,
    specialization: initialSpecialization,
    location: initialLocation,
    availability: initialAvailability
  })

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 3

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || `${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}`

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        // Map backend DB properties to what the frontend expects
        const mapped = (res.data.doctors || res.data || []).map(doc => ({
          id: doc.doctor_id || doc.id,
          name: doc.name || `Dr. ${doc.first_name} ${doc.last_name}`,
          specialization: doc.specialization || 'General Medicine',
          location: doc.location || 'Not Specified',
          availability: doc.availability || 'Today · 4:00 PM',
          experience: doc.experience || '5 years',
          rating: doc.rating || 4.8,
          bio: doc.bio || 'No biography details provided.',
          profile_picture: doc.profile_picture ? `${API_BASE_URL.replace('/api', '')}${doc.profile_picture}` : null
        }))
        setDoctorsList(mapped)
      } catch (err) {
        console.error("Error loading doctors:", err)
        setError("Failed to load doctors list.")
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  // Dynamically calculate filter choices based on fetched doctors
  const specializations = useMemo(() => {
    return ['All', ...new Set(doctorsList.map((doctor) => doctor.specialization))]
  }, [doctorsList])

  const locations = useMemo(() => {
    return ['All', ...new Set(doctorsList.map((doctor) => doctor.location))]
  }, [doctorsList])

  const availabilityOptions = useMemo(() => {
    return ['All', ...new Set(doctorsList.map((doctor) => doctor.availability.split(' · ')[0]))]
  }, [doctorsList])

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = activeFilters.search.trim().toLowerCase()

    return doctorsList.filter((doctor) => {
      const matchesSearch = !normalizedSearch ||
        doctor.name.toLowerCase().includes(normalizedSearch) ||
        doctor.specialization.toLowerCase().includes(normalizedSearch) ||
        doctor.location.toLowerCase().includes(normalizedSearch)

      const matchesSpecialization = activeFilters.specialization === 'All' || doctor.specialization.toLowerCase() === activeFilters.specialization.toLowerCase()
      const matchesLocation = activeFilters.location === 'All' || doctor.location.toLowerCase() === activeFilters.location.toLowerCase()
      const matchesAvailability = activeFilters.availability === 'All' || doctor.availability.toLowerCase().includes(activeFilters.availability.toLowerCase())

      return matchesSearch && matchesSpecialization && matchesLocation && matchesAvailability
    })
  }, [activeFilters, doctorsList])

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedDoctors = filteredDoctors.slice((safePage - 1) * pageSize, safePage * pageSize)

  const applyFilters = () => {
    setActiveFilters({
      search: searchTerm,
      specialization: selectedSpecialization,
      location: selectedLocation,
      availability: selectedAvailability
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedSpecialization('All')
    setSelectedLocation('All')
    setSelectedAvailability('All')
    setActiveFilters({
      search: '',
      specialization: 'All',
      location: 'All',
      availability: 'All'
    })
    setCurrentPage(1)
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    setBookingStatus('Booking...')
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setBookingStatus('Please log in as a patient to book.')
        return
      }
      const user = JSON.parse(userStr)
      if (user.role !== 'PATIENT') {
        setBookingStatus('Only patients can book appointments.')
        return
      }

      const payload = {
        patient_id: user.user_id,
        doctor_id: selectedDoctorForBooking.id,
        appointment_datetime: appointmentDate,
        appointment_type: appointmentType
      }
      
      const res = await axios.post(`${API_BASE_URL}/appointments`, payload)
      if (res.status === 201) {
        setBookingStatus('Appointment booked successfully!')
        setTimeout(() => {
          setSelectedDoctorForBooking(null)
          setBookingStatus('')
          setAppointmentDate('')
        }, 1500)
      } else {
        setBookingStatus('Failed to book appointment.')
      }
    } catch (err) {
      console.error(err)
      setBookingStatus(err.response?.data?.message || 'Failed to book appointment.')
    }
  }

  return (
    <div className="doctor-listing-page">
      <Navbar onNavigate={navigate} />

      <main className="doctor-listing-shell">
        <section className="doctor-listing-header">
          <div>
            <p className="eyebrow">Find the right care</p>
            <h1>Browse available doctors</h1>
            <p className="doctor-listing-text">Search by specialty, location, and availability to book your next appointment quickly.</p>
          </div>
        </section>

        <section className="filters-card" aria-label="Doctor filters">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name or specialty"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="specialization">Filter by Specialization</label>
            <select
              id="specialization"
              value={selectedSpecialization}
              onChange={(event) => setSelectedSpecialization(event.target.value)}
            >
              {specializations.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="location">Filter by Location</label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
            >
              {locations.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              value={selectedAvailability}
              onChange={(event) => setSelectedAvailability(event.target.value)}
            >
              {availabilityOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', paddingBottom: '2px' }}>
            <button type="button" className="primary-btn search-btn" onClick={applyFilters} style={{ padding: '0.8rem 1.2rem', height: '100%' }}>
              Find Doctor
            </button>
            <button type="button" className="secondary-btn reset-btn" onClick={resetFilters} style={{ padding: '0.8rem 1.2rem', height: '100%' }}>
              Reset Filters
            </button>
          </div>
        </section>

        <section className="doctor-cards" aria-label="Doctor cards">
          {loading ? (
            <div className="empty-state">
              <h2>Loading doctors...</h2>
              <p>Please wait while we fetch the doctor directory.</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h2>Error</h2>
              <p>{error}</p>
            </div>
          ) : paginatedDoctors.length > 0 ? (
            paginatedDoctors.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-card-header" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {doctor.profile_picture ? (
                      <img src={doctor.profile_picture} alt={doctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>👨‍⚕️</span>
                    )}
                  </div>
                  <div className="doctor-info" style={{ flex: 1 }}>
                    <h2 className="doctor-name">{doctor.name}</h2>
                    <span className="doctor-specialty-badge">{doctor.specialization}</span>
                  </div>
                  <div className="doctor-rating-box">
                    <span className="doctor-rating-value">{doctor.rating}</span>
                    <span className="doctor-rating-star">⭐</span>
                  </div>
                </div>

                <p className="doctor-bio">{doctor.bio}</p>

                <div className="doctor-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{doctor.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🕒</span>
                    <span className="detail-text">{doctor.availability}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🩺</span>
                    <span className="detail-text">{doctor.experience}</span>
                  </div>
                </div>

                {!isDoctor && (
                  <button type="button" className="primary-btn book-btn" onClick={() => setSelectedDoctorForBooking(doctor)}>Book Appointment</button>
                )}
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h2>No doctors found</h2>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </section>

        <section className="pagination" aria-label="Doctor pagination">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
          >
            Previous
          </button>

          <span className="page-indicator">Page {safePage} of {totalPages}</span>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </section>
      </main>

      {selectedDoctorForBooking && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ marginTop: 0 }}>Book Appointment</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>with {selectedDoctorForBooking.name}</p>
            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>
                Date & Time
                <input 
                  type="datetime-local" 
                  value={appointmentDate} 
                  onChange={(e) => setAppointmentDate(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.78rem', borderRadius: '0.8rem', border: '1px solid #cbd5e1', font: 'inherit', boxSizing: 'border-box' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>
                Appointment Type
                <select 
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  style={{ width: '100%', padding: '0.78rem', borderRadius: '0.8rem', border: '1px solid #cbd5e1', font: 'inherit', boxSizing: 'border-box', backgroundColor: '#fff' }}
                >
                  <option value="MESSAGING">Telemedicine via Live Messaging</option>
                  <option value="AUDIO">Telemedicine via Audio Call</option>
                  <option value="VIDEO">Telemedicine via Video Call</option>
                </select>
              </label>
              
              {bookingStatus && <p style={{ margin: 0, color: bookingStatus.includes('success') ? '#10b981' : '#ef4444', fontWeight: 500 }}>{bookingStatus}</p>}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="secondary-btn" style={{ flex: 1, padding: '0.8rem' }} onClick={() => { setSelectedDoctorForBooking(null); setBookingStatus(''); setAppointmentDate(''); }}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ flex: 1, padding: '0.8rem' }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer onNavigate={navigate} />
    </div>
  )
}

export default DoctorListingPage
