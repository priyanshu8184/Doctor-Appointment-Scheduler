import React, { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './DoctorListingPage.css'

const doctors = [
  {
    id: 1,
    name: 'Dr. Amar Rajput',
    specialization: 'Cardiology',
    location: 'Motihari,Bihar',
    availability: 'Today · 4:00 PM',
    experience: '12 years',
    rating: 4.9,
    bio: 'Specializes in preventive heart care and advanced cardiac diagnostics.',
  },
  {
    id: 2,
    name: 'Dr. Nehal Singh',
    specialization: 'Neurology',
    location: 'Patna,Bihar',
    availability: 'Tomorrow · 10:30 AM',
    experience: '10 years',
    rating: 4.8,
    bio:'Focused on stroke recovery, migraine treatment, and neurological assessments.',
  },
  {
    id: 3,
    name: 'Dr. Jhatka',
    specialization: 'Dermatology',
    location: 'Phurphuri Nagar',
    availability: 'Friday · 1:15 PM',
    experience: '20 years',
    rating: 4.7,
    bio: 'Provides acne, allergy, and skin rejuvenation treatments with a patient-first approach.',
  },
  {
    id: 4,
    name: 'Dr. Ghasita Ram',
    specialization: 'Pediatrics',
    location: 'Indore,Madhya Pradesh',
    availability: 'Saturday · 9:00 AM',
    experience: '14 years',
    rating: 4.9,
    bio: 'Known for gentle, family-focused pediatric care and wellness counseling.',
  },
  {
    id: 5,
    name: 'Dr. MS Dhoni',
    specialization: 'Orthopedics',
    location: 'Ranchi,Jharkhand',
    availability: 'Today · 6:45 PM',
    experience: '9 years',
    rating: 4.6,
    bio: 'Treats joint pain, sports injuries, and post-surgery rehabilitation plans.',
  },
  {
    id: 6,
    name: 'Dr. Suyash Baoney',
    specialization: 'General Medicine',
    location: 'Dhar, Madhya Pradesh',
    availability: 'Monday · 11:00 AM',
    experience: '11 years',
    rating: 4.8,
    bio: 'Offers holistic primary care, chronic disease management, and preventive screenings.',
  },
  {
    id: 7,
    name: 'Dr. Priya Sharma',
    specialization: 'Psychiatry',
    location: 'Mumbai,Maharashtra',
    availability: 'Tuesday · 2:30 PM',
    experience: '15 years',
    rating: 4.9,
    bio: 'Provides comprehensive mental health services and therapeutic support.',
  },
  {
    id: 8,
    name: 'Dr. Sameer Ansari',
    specialization: 'Ophthalmology',
    location: 'Delhi,India',
    availability: 'Wednesday · 3:15 PM',
    experience: '18 years',
    rating: 4.8,
    bio: 'Specializes in cataract surgery, LASIK, and comprehensive eye care.',
  },
  {
    id: 9,
    name: 'Dr. Deepak Sharma',
    specialization: 'ENT',
    location: 'Jaipur,Rajasthan',
    availability: 'Thursday · 10:00 AM',
    experience: '16 years',
    rating: 4.7,
    bio: 'Expert in diagnosing and treating ear, nose, and throat conditions.',
  },
  {
    id: 10,
    name: 'Dr. Aisha Khan',
    specialization: 'Gynecology',
    location: 'Lucknow,Uttar Pradesh',
    availability: 'Friday · 11:30 AM',
    experience: '13 years',
    rating: 4.8,
    bio: 'Provides comprehensive women\'s health services and personalized care.',
  }
]

const specializations = ['All', ...new Set(doctors.map((doctor) => doctor.specialization))]
const locations = ['All', ...new Set(doctors.map((doctor) => doctor.location))]
const availabilityOptions = ['All', 'Today', 'Tomorrow', 'Friday', 'Saturday', 'Monday']

const DoctorListingPage = ({ navigate }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [selectedAvailability, setSelectedAvailability] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 3

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return doctors.filter((doctor) => {
      const matchesSearch = !normalizedSearch ||
        doctor.name.toLowerCase().includes(normalizedSearch) ||
        doctor.specialization.toLowerCase().includes(normalizedSearch) ||
        doctor.location.toLowerCase().includes(normalizedSearch)

      const matchesSpecialization = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization
      const matchesLocation = selectedLocation === 'All' || doctor.location === selectedLocation
      const matchesAvailability = selectedAvailability === 'All' || doctor.availability.includes(selectedAvailability)

      return matchesSearch && matchesSpecialization && matchesLocation && matchesAvailability
    })
  }, [searchTerm, selectedSpecialization, selectedLocation, selectedAvailability])

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedDoctors = filteredDoctors.slice((safePage - 1) * pageSize, safePage * pageSize)

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedSpecialization('All')
    setSelectedLocation('All')
    setSelectedAvailability('All')
    setCurrentPage(1)
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
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="specialization">Filter by Specialization</label>
            <select
              id="specialization"
              value={selectedSpecialization}
              onChange={(event) => {
                setSelectedSpecialization(event.target.value)
                setCurrentPage(1)
              }}
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
              onChange={(event) => {
                setSelectedLocation(event.target.value)
                setCurrentPage(1)
              }}
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
              onChange={(event) => {
                setSelectedAvailability(event.target.value)
                setCurrentPage(1)
              }}
            >
              {availabilityOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <button type="button" className="secondary-btn reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </section>

        <section className="doctor-cards" aria-label="Doctor cards">
          {paginatedDoctors.length > 0 ? (
            paginatedDoctors.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-card-header">
                  <div className="doctor-info">
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

                <button type="button" className="primary-btn book-btn">Book Appointment</button>
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

      <Footer onNavigate={navigate} />
    </div>
  )
}

export default DoctorListingPage
