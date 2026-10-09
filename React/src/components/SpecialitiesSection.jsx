import React, { useState, useEffect } from 'react'
import axios from 'axios'

const specialtyDetails = {
  'General Medicine': {
    description: 'Comprehensive primary care, fever, chronic illness management, and routine wellness checkups.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
        <circle cx="20" cy="10" r="2"/>
      </svg>
    )
  },
  'Cardiologist': {
    description: 'Heart health, ECG diagnostics, blood pressure management, and cardiovascular therapies.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        <path d="M12 9v4"/>
        <path d="M10 11h4"/>
      </svg>
    )
  },
  'Dermatologist': {
    description: 'Clinical skin care, adult acne treatment, eczema, allergy tests, and laser therapeutics.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v4"/>
        <path d="M12 18v4"/>
        <path d="M4.93 4.93l2.83 2.83"/>
        <path d="M16.24 16.24l2.83 2.83"/>
        <path d="M2 12h4"/>
        <path d="M18 12h4"/>
        <path d="M4.93 19.07l2.83-2.83"/>
        <path d="M16.24 7.76l2.83-2.83"/>
      </svg>
    )
  },
  'Neurologist': {
    description: 'Brain, nervous system, migraine relief, vertigo diagnosis, and neuropathy management.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04Z"/>
      </svg>
    )
  },
  'Pediatrician': {
    description: 'Infant care, child development tracking, pediatric illness, and immunization schedules.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="5"/>
        <path d="M20 21a8 8 0 0 0-16 0"/>
        <path d="M12 13v3"/>
      </svg>
    )
  },
  'Orthopedic': {
    description: 'Bone, joint, spine health, ligament strains, sports injuries, and arthritis rehabilitation.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3v18"/>
        <path d="M18 3v18"/>
        <path d="M6 8h12"/>
        <path d="M6 16h12"/>
      </svg>
    )
  },
  'Psychiatrist': {
    description: 'Mental health assessment, anxiety relief, mood disorders, and psychological counseling.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 9h8"/>
        <path d="M8 13h6"/>
      </svg>
    )
  },
  'Gynecologist': {
    description: "Women's wellness, prenatal checkups, reproductive care, and maternal health guidance.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="9" r="6"/>
        <path d="M12 15v7"/>
        <path d="M9 19h6"/>
      </svg>
    )
  },
  'Dentist': {
    description: 'Dental checkups, oral hygiene, root canals, cavity prevention, and cosmetic dentistry.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2C8.5 2 6 4 6 7c0 4 2 8 3 13 1 1 2 2 3 2s2-1 3-2c1-5 3-9 3-13 0-3-2.5-5-6-5z"/>
        <path d="M9 8h6"/>
      </svg>
    )
  },
  'ENT Specialist': {
    description: 'Ear infections, sinusitis, throat irritation, nasal allergies, and hearing evaluations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10"/>
        <circle cx="12" cy="19" r="1"/>
      </svg>
    )
  },
  'Oncologist': {
    description: 'Comprehensive oncology consultations, tumor screening, and cancer care plans.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    )
  }
}

const defaultList = [
  'General Medicine',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Orthopedic',
  'Psychiatrist',
  'Gynecologist'
]

const SpecialitiesSection = ({ navigate }) => {
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const fetchSpecialties = async () => {
      let uniqueSpecs = []
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const doctorsData = res.data.doctors || res.data || []
        uniqueSpecs = [...new Set(doctorsData.map(doc => doc.specialization || doc.specialty).filter(Boolean))]
      } catch (err) {
        console.warn("Using default specialty list:", err.message)
      } finally {
        const specsToUse = uniqueSpecs.length > 0 ? uniqueSpecs : defaultList
        
        const mapped = specsToUse.slice(0, 8).map(specName => {
          const detail = specialtyDetails[specName] || {
            description: 'Comprehensive medical consultations and specialized health care.',
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            )
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

  const handleCardClick = (specName) => {
    const targetUrl = `/doctors?specialization=${encodeURIComponent(specName)}`
    if (navigate) {
      navigate(targetUrl)
    } else {
      window.location.href = targetUrl
    }
  }

  return (
    <section className="specialties-section-wrapper" id="specialties">
      <div className="section-container">
        <div className="section-header-row">
          <div>
            <span className="section-eyebrow">Medical Departments</span>
            <h2 className="section-title">Explore trusted healthcare specialties</h2>
            <p className="section-subtitle">Board-certified clinicians offering in-person clinic visits and telemedicine consultations.</p>
          </div>
          <button 
            className="section-header-link-btn"
            onClick={() => navigate ? navigate('/doctors') : (window.location.href = '/doctors')}
          >
            <span>All Specialties</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="specialties-grid">
          {loading ? (
            <div className="specialty-loading-state">
              <span>Loading clinical specialties...</span>
            </div>
          ) : (
            specialties.map((item) => (
              <div 
                className="specialty-card-item" 
                key={item.title}
                onClick={() => handleCardClick(item.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(item.title) }}
              >
                <div className="specialty-icon-container">
                  {item.icon}
                </div>
                <h3 className="specialty-card-title">{item.title}</h3>
                <p className="specialty-card-desc">{item.desc}</p>
                <div className="specialty-action-link">
                  <span>View Doctors</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default SpecialitiesSection
