import React, { useState, useEffect } from 'react'
import axios from 'axios'

const specialtyDetails = {
  'Cardiologist': {
    description: 'Heart health, cardiovascular treatments, and chest pain consultations.',
    icon: '❤️'
  },
  'Dermatologist': {
    description: 'Skin care, acne treatments, allergy diagnosis, and cosmetic procedures.',
    icon: '✨'
  },
  'Neurologist': {
    description: 'Brain, spinal cord, nervous system treatments, and migraine relief.',
    icon: '🧠'
  },
  'Pediatrician': {
    description: 'Infant, child and adolescent medical care and vaccinations.',
    icon: '👶'
  },
  'Psychiatrist': {
    description: 'Mental health, therapy, anxiety management, and cognitive wellness.',
    icon: '💬'
  },
  'Oncologist': {
    description: 'Cancer care, tumors, and malignant growth treatments.',
    icon: '☢️'
  },
  'Gynecologist': {
    description: "Women's health, pregnancy, and reproductive system care.",
    icon: '🤰'
  },
  'Ophthalmologist': {
    description: 'Eye care, vision correction, and eye disease treatments.',
    icon: '👁️'
  },
  'Orthopedic': {
    description: 'Bone, joint, and muscle care, trauma, and sports injuries.',
    icon: '🦴'
  },
  'Dentist': {
    description: 'Dental health, teeth care, and oral hygiene.',
    icon: '🦷'
  },
  'ENT Specialist': {
    description: 'Ear, nose, and throat care, infections, and hearing issues.',
    icon: '👂'
  },
  'Diabetologist': {
    description: 'Diabetes management, blood sugar control, and metabolic care.',
    icon: '🩸'
  },
  'Endocrinologist': {
    description: 'Hormone disorders, thyroid, and metabolic health.',
    icon: '🫁'
  },
  'Gastroenterologist': {
    description: 'Digestive system, stomach, and intestine care.',
    icon: '🫁'
  }
}

const SpecialitiesSection = ({ navigate }) => {
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const fetchSpecialties = async () => {
      let uniqueSpecs = []
      try {
        setLoading(true)
        // Fetch all doctors to extract specialties from registered users
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const doctorsData = res.data.doctors || res.data || []
        
        // Extract unique specialties entered by registered doctors
        uniqueSpecs = [...new Set(doctorsData.map(doc => doc.specialization).filter(Boolean))]
      } catch (err) {
        console.error("Error fetching specialties from registered doctors:", err)
      } finally {
        // Fallback to default specialties if no doctors are registered or fetch failed
        const specsToUse = uniqueSpecs.length > 0 ? uniqueSpecs : ['General Medicine', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Psychiatrist']
        
        const mapped = specsToUse.map(specName => {
          const detail = specialtyDetails[specName] || {
            description: 'Comprehensive medical consultations and specialized health care.',
            icon: '🏥'
          }
          return {
            title: specName,
            desc: detail.description,
            icon: detail.icon
          }
        })
        
        setSpecialties(mapped)
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
            <article 
              className="info-card specialty-card" 
              key={item.title}
              onClick={() => navigate && navigate(`/doctors?specialization=${encodeURIComponent(item.title)}`)}
            >
              <div className="specialty-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="view-more-link">
                Find Doctors <span>&rarr;</span>
              </span>
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
