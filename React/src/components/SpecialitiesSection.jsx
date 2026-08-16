import React, { useState, useEffect } from 'react'
import axios from 'axios'

const SpecialitiesSection = () => {
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || `${import.meta.env.VITE_BACKEND_BASE_URL}`

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/specialties`)
        const fetched = (res.data.specialties || res.data || []).map(spec => ({
          title: spec.name,
          desc: spec.description || 'No description provided.'
        }))
        setSpecialties(fetched)
      } catch (err) {
        console.error("Error fetching specialties:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSpecialties()
  }, [])

  return (
    <section className="section-block" id="specialties">
      <div className="section-heading">
        <p className="eyebrow">Specialities</p>
        <h2>Explore trusted medical specialties.</h2>
      </div>

      <div className="cards-grid">
        {loading ? (
          <p>Loading specialties...</p>
        ) : specialties.length > 0 ? (
          specialties.map((item) => (
            <article className="info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))
        ) : (
          <p>No specialties available at the moment.</p>
        )}
      </div>
    </section>
  )
}

export default SpecialitiesSection
