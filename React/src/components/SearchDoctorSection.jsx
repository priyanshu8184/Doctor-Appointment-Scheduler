import React, { useState, useEffect } from 'react'
import axios from 'axios'

const defaultSpecialties = [
  'General Medicine',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
  'Orthopedic',
  'Gynecologist',
  'Dentist'
]

const defaultLocations = [
  'Indore',
  'Bhopal',
  'Varanasi',
  'Patna',
  'Lucknow',
  'Delhi',
  'Ahmedabad'
]

const defaultAvailabilities = [
  'Today',
  'Tomorrow',
  'This weekend'
]

const quickFilters = [
  { label: 'Dermatologist', query: 'Dermatologist' },
  { label: 'Cardiologist', query: 'Cardiologist' },
  { label: 'General Physician', query: 'General Medicine' },
  { label: 'Pediatrician', query: 'Pediatrician' },
  { label: 'Available Today', availability: 'Today' }
]

const SearchDoctorSection = ({ navigate }) => {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState('')

  const [locations, setLocations] = useState(defaultLocations)
  const [availabilities, setAvailabilities] = useState(defaultAvailabilities)
  const [searchSuggestions, setSearchSuggestions] = useState(defaultSpecialties)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const fetchSearchFilters = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const docs = res.data.doctors || res.data || []
        
        if (docs.length > 0) {
          const specs = [...new Set(docs.map(doc => doc.specialization || doc.specialty).filter(Boolean))]
          const names = docs.map(doc => doc.name || `Dr. ${doc.first_name} ${doc.last_name}`).filter(Boolean)
          const locs = [...new Set(docs.map(doc => doc.location).filter(Boolean))]
          const avails = [...new Set(docs.map(doc => typeof doc.availability === 'string' ? doc.availability.split(' · ')[0] : null).filter(Boolean))]

          setLocations(locs.length > 0 ? locs : defaultLocations)
          setAvailabilities(avails.length > 0 ? avails : defaultAvailabilities)
          
          const combinedSuggestions = [...new Set([...(specs.length > 0 ? specs : defaultSpecialties), ...names])]
          setSearchSuggestions(combinedSuggestions)
        }
      } catch (err) {
        console.warn("Using default search options:", err.message)
      }
    }
    fetchSearchFilters()
  }, [])

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (location) params.append('location', location)
    if (availability) params.append('availability', availability)

    const targetUrl = `/doctors?${params.toString()}`
    if (navigate) {
      navigate(targetUrl)
    } else {
      window.location.href = targetUrl
    }
  }

  const handleQuickFilter = (item) => {
    const params = new URLSearchParams()
    if (item.query) params.append('search', item.query)
    if (item.availability) params.append('availability', item.availability)

    const targetUrl = `/doctors?${params.toString()}`
    if (navigate) {
      navigate(targetUrl)
    } else {
      window.location.href = targetUrl
    }
  }

  return (
    <section className="search-section-wrapper" id="search-doctor">
      <div className="section-container">
        <div className="search-console-card">
          <div className="search-console-header">
            <span className="search-eyebrow">Smart Provider Search</span>
            <h2>Find certified doctors by specialty, symptom, or location</h2>
          </div>

          <form className="search-form-grid" onSubmit={handleSubmit}>
            <div className="search-input-group">
              <span className="search-group-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <div className="search-input-text-wrap">
                <label htmlFor="doctor-specialty-input">Condition, specialty, or doctor</label>
                <input
                  id="doctor-specialty-input"
                  type="text"
                  placeholder="e.g. Skin rash, Cardiologist, Dr. Sharma..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  list="doctor-specialty-options"
                />
                <datalist id="doctor-specialty-options">
                  {searchSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="search-divider" />

            <div className="search-input-group">
              <span className="search-group-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <div className="search-input-text-wrap">
                <label htmlFor="location-select">City / Location</label>
                <select
                  id="location-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-divider" />

            <div className="search-input-group">
              <span className="search-group-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <div className="search-input-text-wrap">
                <label htmlFor="availability-select">Date / Slot</label>
                <select
                  id="availability-select"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="">Any Available Time</option>
                  {availabilities.map((avail) => (
                    <option key={avail} value={avail}>
                      {avail}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="primary-btn search-submit-btn" type="submit">
              <span>Find Care</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="search-quick-tags">
            <span className="quick-label">Popular searches:</span>
            <div className="quick-pills-list">
              {quickFilters.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-pill-btn"
                  onClick={() => handleQuickFilter(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchDoctorSection
