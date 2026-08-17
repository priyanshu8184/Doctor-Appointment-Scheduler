import React, { useState, useEffect } from 'react'
import axios from 'axios'

const defaultSpecialties = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
  'Oncologist',
  'Gynecologist',
  'Ophthalmologist',
  'Orthopedic',
  'Dentist',
  'ENT Specialist',
  'Diabetologist',
  'Endocrinologist',
  'Gastroenterologist'
]

const defaultLocations = [
  'Indore',
  'Bhopal',
  'Varansi',
  'Patna',
  'Motihari',
  'Lucknow',
  'Delhi',
  'Ahmedabad'
]

const defaultAvailabilities = [
  'Today',
  'Tomorrow',
  'This weekend'
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
          // Extract unique specialties
          const specs = [...new Set(docs.map(doc => doc.specialization).filter(Boolean))]
          // Extract doctor names
          const names = docs.map(doc => doc.name || `Dr. ${doc.first_name} ${doc.last_name}`).filter(Boolean)
          
          // Extract unique locations
          const locs = [...new Set(docs.map(doc => doc.location).filter(Boolean))]
          
          // Extract unique availabilities (days/periods before the divider)
          const avails = [...new Set(docs.map(doc => doc.availability ? doc.availability.split(' · ')[0] : null).filter(Boolean))]

          setLocations(locs.length > 0 ? locs : defaultLocations)
          setAvailabilities(avails.length > 0 ? avails : defaultAvailabilities)
          
          const combinedSuggestions = [...new Set([...(specs.length > 0 ? specs : defaultSpecialties), ...names])]
          setSearchSuggestions(combinedSuggestions)
        }
      } catch (err) {
        console.error("Error fetching dynamic search options, using defaults:", err)
      }
    }
    fetchSearchFilters()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (location) params.append('location', location)
    if (availability) params.append('availability', availability)

    if (navigate) {
      navigate(`/doctors?${params.toString()}`)
    }
  }

  return (
    <section className="section-block" id="search-doctor">
      <div className="section-heading">
        <p className="eyebrow">Search Doctor</p>
        <h2>Find the right doctor as per your need.</h2>
      </div>

      <form className="search-card" onSubmit={handleSubmit}>
        <div className="search-field">
          <label htmlFor="doctor-specialty-input">Doctor or specialty</label>
          <input
            id="doctor-specialty-input"
            type="text"
            placeholder="Cardiologist, dentist, pediatrics..."
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

        <div className="search-field">
          <label htmlFor="location-select">Location</label>
          <select
            id="location-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Choose city</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="search-field">
          <label htmlFor="availability-select">Availability</label>
          <select
            id="availability-select"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Select date</option>
            {availabilities.map((avail) => (
              <option key={avail} value={avail}>
                {avail}
              </option>
            ))}
          </select>
        </div>

        <button className="primary-btn search-btn" type="submit">
          Find Doctor
        </button>
      </form>
    </section>
  )
}

export default SearchDoctorSection
