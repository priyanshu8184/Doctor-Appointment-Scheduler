import React, { useMemo, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './DoctorListingPage.css'
import axios from 'axios'
import { SAMPLE_DOCTORS } from '../../../AI/index.js'

// Authentic clinician portrait mapping with fallback
const DOCTOR_PORTRAITS = {
  101: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=320&q=80',
  102: 'https://images.unsplash.com/photo-1594824813589-9a250325ff2a?auto=format&fit=crop&w=320&q=80',
  103: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&q=80',
  104: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=80',
  105: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=320&q=80',
  106: 'https://images.unsplash.com/photo-1594824813589-9a250325ff2a?auto=format&fit=crop&w=320&q=80'
}

const getDoctorPortrait = (doc, idx) => {
  if (doc.profile_picture) return doc.profile_picture
  if (doc.image) return doc.image
  const id = doc.id || doc.doctor_id || (101 + (idx % 6))
  return DOCTOR_PORTRAITS[id] || DOCTOR_PORTRAITS[101 + (idx % 6)]
}

const DoctorListingPage = ({ navigate }) => {
  const [doctorsList, setDoctorsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [failedImages, setFailedImages] = useState({})

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
  const pageSize = 6

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    if (isDoctor) {
      if (navigate) navigate('/doctor-dashboard')
      else window.location.href = '/doctor-dashboard'
      return
    }
  }, [isDoctor, navigate])

  useEffect(() => {
    if (isDoctor) return
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const docsList = res.data.doctors || res.data || []
        const listToUse = docsList.length > 0 ? docsList : SAMPLE_DOCTORS
        // Map backend DB properties to what the frontend expects
        const mapped = listToUse.map((doc, idx) => ({
          id: doc.doctor_id || doc.id || (101 + idx),
          name: doc.name || `Dr. ${doc.first_name} ${doc.last_name}`,
          specialization: doc.specialty || doc.specialization || 'General Medicine',
          location: doc.location || 'HealPoint Medical Center',
          availability: typeof doc.availability === 'string' ? doc.availability : 'Today · 4:00 PM',
          experience: doc.experience || '8+ years exp',
          rating: Number(doc.rating || 4.8).toFixed(1),
          reviewsCount: doc.reviews_count || (110 + idx * 12),
          fee: doc.consultation_fee ? `₹${doc.consultation_fee}` : '₹650',
          bio: doc.bio || 'Board-certified specialist dedicated to compassionate, evidence-based patient care.',
          portraitUrl: getDoctorPortrait(doc, idx)
        }))
        setDoctorsList(mapped)
      } catch (err) {
        console.warn("Error loading doctors from API, using registered doctors:", err.message)
        const mapped = (SAMPLE_DOCTORS || []).map((doc, idx) => ({
          id: doc.doctor_id,
          name: doc.name,
          specialization: doc.specialty,
          location: doc.location,
          availability: 'Today · 4:00 PM',
          experience: doc.experience || '8+ years exp',
          rating: Number(doc.rating).toFixed(1),
          reviewsCount: doc.reviews_count || 124,
          fee: `₹${doc.consultation_fee}`,
          bio: doc.bio || 'Board-certified specialist dedicated to compassionate, evidence-based patient care.',
          portraitUrl: getDoctorPortrait(doc, idx)
        }))
        setDoctorsList(mapped)
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
            paginatedDoctors.map((doctor) => {
              const cleanInitial = doctor.name.replace('Dr. ', '').charAt(0) || 'D'
              const isImageFailed = failedImages[doctor.id]

              return (
                <article className="doctor-card" key={doctor.id}>
                  <div className="doc-card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className="doc-avail-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#087F72', background: 'rgba(8, 127, 114, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '100px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#087F72' }} />
                      <span>{doctor.availability}</span>
                    </span>
                    <span className="doc-fee-badge" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111C2F', background: '#F5F8F6', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E1E8E5' }}>{doctor.fee}</span>
                  </div>

                  <div className="doctor-card-header" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E1E8E5' }}>
                    <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E1E8E5', background: '#F5F8F6' }}>
                      {!isImageFailed ? (
                        <img 
                          src={doctor.portraitUrl} 
                          alt={doctor.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={() => setFailedImages(prev => ({ ...prev, [doctor.id]: true }))}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #111C2F, #087F72)', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                          {cleanInitial}
                        </div>
                      )}
                      <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '15px', height: '15px', borderRadius: '50%', background: '#087F72', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, border: '1.5px solid #fff' }}>✓</span>
                    </div>

                    <div className="doctor-info" style={{ flex: 1, minWidth: 0 }}>
                      <h2 className="doctor-name" style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#172033', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.name}</h2>
                      <span className="doctor-specialty-badge" style={{ display: 'inline-block', background: 'rgba(8, 127, 114, 0.08)', color: '#087F72', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{doctor.specialization}</span>
                    </div>

                    <div className="doctor-rating-box" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                      <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★</span>
                      <strong style={{ fontSize: '0.85rem', color: '#92400E' }}>{doctor.rating}</strong>
                    </div>
                  </div>

                  <p className="doctor-bio" style={{ margin: '0 0 0.85rem', color: '#5B6778', fontSize: '0.88rem', lineHeight: 1.55 }}>{doctor.bio}</p>

                  <div className="doctor-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem', flexGrow: 1 }}>
                    <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5B6778' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="detail-text" style={{ fontWeight: 500 }}>{doctor.location}</span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5B6778' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <span className="detail-text" style={{ fontWeight: 500 }}>{doctor.experience}</span>
                    </div>
                  </div>

                  {!isDoctor && (
                    <button 
                      type="button" 
                      className="primary-btn book-btn" 
                      onClick={() => setSelectedDoctorForBooking(doctor)}
                      style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', border: 'none', background: '#087F72', color: '#ffffff' }}
                    >
                      Book Appointment
                    </button>
                  )}
                </article>
              )
            })
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
