import { useState, useEffect } from 'react'
import axios from 'axios'
import { SAMPLE_DOCTORS } from '../../../AI/index.js'

const HeroSection = ({ navigate }) => {
  const [featuredDoctor, setFeaturedDoctor] = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const docsData = res.data.doctors || res.data || []
        if (docsData.length > 0) {
          setFeaturedDoctor(docsData[0])
        } else {
          setFeaturedDoctor(SAMPLE_DOCTORS[0])
        }
      } catch (err) {
        // Silent fallback to local verified doctor profile
        setFeaturedDoctor(SAMPLE_DOCTORS[0])
      }
    }
    fetchDoctor()
  }, [])

  const doc = featuredDoctor || SAMPLE_DOCTORS[0]
  const docName = doc.name || `Dr. ${doc.first_name} ${doc.last_name}`
  const docSpecialty = doc.specialty || doc.specialization || 'General Medicine'
  const docRating = doc.rating || '4.9'
  const docInitial = docName.replace('Dr. ', '').charAt(0) || 'D'

  const handleFindDoctor = () => {
    if (navigate) {
      navigate('/doctors')
    } else {
      window.location.href = '/doctors'
    }
  }

  const handleHowItWorks = (e) => {
    e.preventDefault()
    const targetElement = document.getElementById('how-it-works')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    } else if (navigate) {
      navigate('/#how-it-works')
    } else {
      window.location.href = '/#how-it-works'
    }
  }

  const handleDoctorClick = () => {
    const targetUrl = `/doctors?search=${encodeURIComponent(docName)}`
    if (navigate) {
      navigate(targetUrl)
    } else {
      window.location.href = targetUrl
    }
  }

  return (
    <section className="hero-section" id="home">
      <div className="hero-copy">
        <div className="hero-eyebrow-badge">
          <span className="eyebrow-indicator" />
          <span>Trusted Healthcare Network</span>
        </div>

        <h1 className="hero-title">
          The right care starts with the <span className="highlight-teal">right doctor</span>.
        </h1>
        
        <p className="hero-text">
          Connect with board-certified physicians, choose verified in-person or video appointments, and take charge of your health with confidence.
        </p>

        <div className="hero-actions">
          <button 
            className="primary-btn hero-main-btn"
            onClick={handleFindDoctor}
          >
            <span>Find a Doctor</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <a 
            className="secondary-btn hero-secondary-btn"
            href="#how-it-works"
            onClick={handleHowItWorks}
          >
            <span>How It Works</span>
          </a>
        </div>

        <div className="hero-trust-list">
          <div className="trust-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>Board-Certified Clinicians</span>
          </div>
          <div className="trust-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Same-Day Appointments</span>
          </div>
          <div className="trust-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>In-Person & Video Care</span>
          </div>
        </div>
      </div>

      <div className="hero-media-wrapper">
        <div className="hero-photo-frame">
          {!imgError ? (
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80" 
              alt="Medical doctor in clinical setting"
              className="hero-clinical-photo"
              loading="eager"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="hero-photo-fallback">
              <div className="fallback-inner">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                  <circle cx="20" cy="10" r="2"/>
                </svg>
                <p>HealPoint Clinical Network</p>
              </div>
            </div>
          )}

          {/* Tasteful Overlapping Appointment Information Panel */}
          <div 
            className="hero-appointment-panel"
            onClick={handleDoctorClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDoctorClick() }}
            aria-label={`Book appointment with ${docName}`}
          >
            <div className="panel-status-row">
              <span className="panel-pulse-dot" />
              <span className="panel-status-text">Available Today</span>
            </div>

            <div className="panel-doctor-info">
              <div className="panel-avatar">
                <span>{docInitial}</span>
                <span className="panel-check">✓</span>
              </div>
              <div className="panel-meta">
                <h4 className="panel-doc-name">{docName}</h4>
                <p className="panel-doc-spec">{docSpecialty}</p>
                <div className="panel-rating">
                  <span className="panel-star">★</span>
                  <span>{docRating}</span>
                  <span className="panel-bullet">•</span>
                  <span className="panel-timing">Today, 3:30 PM</span>
                </div>
              </div>
            </div>

            <div className="panel-action-btn">
              <span>Book Appointment</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
