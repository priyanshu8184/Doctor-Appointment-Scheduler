import { useState, useEffect } from 'react'
import axios from 'axios'

const HeroSection = ({ navigate }) => {
  const [doctors, setDoctors] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState('fade-in')

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const doctorsData = res.data.doctors || res.data || []
        setDoctors(doctorsData)
      } catch (err) {
        console.error("Error fetching available doctor:", err)
      }
    }
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (doctors.length <= 1) return

    const interval = setInterval(() => {
      setFadeClass('fade-out')
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % doctors.length)
        setFadeClass('fade-in')
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [doctors.length])

  const availableDoctor = doctors[currentIndex] || null

  return (
    <section className="hero-section" id="appointment">
      <div className="hero-copy">
        <p className="eyebrow">Healthcare made simple</p>
        <h1>Your health journey starts with HealPoint.</h1>
        <p className="hero-text">
          Book trusted medical appointments online, discover top specialists,
          and feel confident about every visit.
        </p>

        <div className="hero-actions">
          <a className="primary-btn" href="/signup">Get Started</a>
          <a className="secondary-btn" href="/login">Log In</a>
        </div>

        <ul className="stats-list">
          <li>
            <strong>10k+</strong>
            <span>Patients helped</span>
          </li>
          <li>
            <strong>200+</strong>
            <span>Doctors listed</span>
          </li>
          <li>
            <strong>4.9/5</strong>
            <span>Rated experience</span>
          </li>
        </ul>
      </div>

      {availableDoctor ? (
        <div className="hero-card" aria-label="Appointment preview">
          <div className={`fade-transition ${fadeClass}`}>
            <div className="card-top">
              <span className="card-badge">Available Today</span>
              <h3>Dr. {availableDoctor.first_name} {availableDoctor.last_name}</h3>
              <p>{availableDoctor.specialization || 'General Physician'} • 2:30 PM</p>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <div className="mini-pill">Online consultation</div>
                <div className="mini-pill">Same-day booking</div>
                <div className="mini-pill">Insurance accepted</div>
              </div>
              <button
                className="primary-btn"
                onClick={() => {
                  const docName = `${availableDoctor.first_name} ${availableDoctor.last_name}`
                  navigate(`/doctors?search=${encodeURIComponent(docName)}`)
                }}
                style={{ width: '100%', padding: '0.6rem', textAlign: 'center', fontSize: '1rem' }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hero-card" aria-label="Appointment preview">
          <div className="card-top">
            <span className="card-badge">Available Today</span>
            <h3>Finding Doctors...</h3>
            <p>Please wait</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default HeroSection
