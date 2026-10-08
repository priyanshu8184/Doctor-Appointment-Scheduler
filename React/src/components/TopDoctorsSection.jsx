import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SAMPLE_DOCTORS } from '../../../AI/index.js'

const TopDoctorsSection = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const docsList = res.data.doctors || res.data || []
        const listToUse = docsList.length > 0 ? docsList : SAMPLE_DOCTORS
        const fetched = listToUse.slice(0, 3).map(doc => ({
          name: doc.name || `Dr. ${doc.first_name} ${doc.last_name}`,
          specialty: doc.specialty || doc.specialization || 'General Medicine',
          rating: doc.rating || '4.8',
          availability: typeof doc.availability === 'string' ? doc.availability : 'Next available: Today'
        }))
        setDoctors(fetched)
      } catch (err) {
        console.warn("Using registered fallback doctors:", err.message)
        const fetched = SAMPLE_DOCTORS.slice(0, 3).map(doc => ({
          name: doc.name,
          specialty: doc.specialty,
          rating: doc.rating,
          availability: 'Next available: Today'
        }))
        setDoctors(fetched)
      } finally {
        setLoading(false)
      }
    }
    fetchTopDoctors()
  }, [])

  return (
    <section className="section-block" id="top-doctors">
      <div className="section-heading">
        <p className="eyebrow">Top Doctors</p>
        <h2>Meet highly rated doctors near you.</h2>
      </div>

      <div className="cards-grid doctor-grid">
        {loading ? (
          <div className="empty-state"><p>Loading doctors...</p></div>
        ) : doctors.length > 0 ? (
          doctors.map((doctor) => (
            <article className="doctor-card" key={doctor.name}>
              <div className="doctor-avatar">{doctor.name.charAt(4)}</div>
              <h3>{doctor.name}</h3>
              <p>{doctor.specialty}</p>
              <div className="doctor-meta">
                <span>⭐ {doctor.rating}</span>
                <span>{doctor.availability}</span>
              </div>
              <a className="secondary-btn" href="#appointment">
                View Profile
              </a>
            </article>
          ))
        ) : (
          <p>No doctors available at the moment.</p>
        )}
      </div>
    </section>
  )
}

export default TopDoctorsSection
