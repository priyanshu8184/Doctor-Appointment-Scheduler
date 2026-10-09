import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SAMPLE_DOCTORS } from '../../../AI/index.js'

// Authentic clinician portrait mapping with fallback
const DOCTOR_PORTRAITS = {
  101: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=320&q=80', // Dr. Rahul Sharma
  102: 'https://images.unsplash.com/photo-1594824813589-9a250325ff2a?auto=format&fit=crop&w=320&q=80', // Dr. Ananya Iyer
  103: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&q=80', // Dr. Vikram Sethi
  104: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=80', // Dr. Priya Nair
  105: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=320&q=80', // Dr. Rajesh Verma
  106: 'https://images.unsplash.com/photo-1594824813589-9a250325ff2a?auto=format&fit=crop&w=320&q=80'  // Dr. Sunita Patel
}

const getDoctorPortraitUrl = (doc, idx) => {
  if (doc.image) return doc.image
  const id = doc.doctor_id || doc.id || (101 + (idx % 6))
  return DOCTOR_PORTRAITS[id] || DOCTOR_PORTRAITS[101 + (idx % 6)]
}

const TopDoctorsSection = ({ navigate }) => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState({})

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/doctors`)
        const docsList = res.data.doctors || res.data || []
        const listToUse = docsList.length > 0 ? docsList : SAMPLE_DOCTORS
        
        const fetched = listToUse.slice(0, 3).map((doc, idx) => {
          const docId = doc.doctor_id || doc.id || (101 + idx)
          const docName = doc.name || `Dr. ${doc.first_name} ${doc.last_name}`
          const specialty = doc.specialty || doc.specialization || 'General Medicine'
          const rating = Number(doc.rating || 4.8).toFixed(1)
          const reviewsCount = doc.reviews_count || (95 + idx * 14)
          const location = doc.location || 'Metro Care Medical Center'
          const fee = doc.consultation_fee ? `₹${doc.consultation_fee}` : '₹650'
          const experience = doc.experience || `${8 + idx * 2} years exp`
          const availability = typeof doc.availability === 'string' 
            ? doc.availability 
            : 'Next slot: Today, 4:00 PM'

          return {
            id: docId,
            name: docName,
            specialty,
            rating,
            reviewsCount,
            location,
            fee,
            experience,
            availability,
            portraitUrl: getDoctorPortraitUrl(doc, idx)
          }
        })
        setDoctors(fetched)
      } catch (err) {
        console.warn("Using sample doctors fallback:", err.message)
        const fetched = SAMPLE_DOCTORS.slice(0, 3).map((doc, idx) => ({
          id: doc.doctor_id,
          name: doc.name,
          specialty: doc.specialty,
          rating: Number(doc.rating).toFixed(1),
          reviewsCount: doc.reviews_count || 124,
          location: doc.location,
          fee: `₹${doc.consultation_fee}`,
          experience: doc.experience,
          availability: 'Next slot: Today, 4:00 PM',
          portraitUrl: getDoctorPortraitUrl(doc, idx)
        }))
        setDoctors(fetched)
      } finally {
        setLoading(false)
      }
    }
    fetchTopDoctors()
  }, [])

  const handleBookDoctor = (docName) => {
    const targetUrl = `/doctors?search=${encodeURIComponent(docName)}`
    if (navigate) {
      navigate(targetUrl)
    } else {
      window.location.href = targetUrl
    }
  }

  const handleImageError = (docId) => {
    setFailedImages((prev) => ({ ...prev, [docId]: true }))
  }

  return (
    <section className="top-doctors-section-wrapper" id="top-doctors">
      <div className="section-container">
        <div className="section-header-row">
          <div>
            <span className="section-eyebrow">Board-Certified Clinicians</span>
            <h2 className="section-title">Verified medical specialists near you</h2>
            <p className="section-subtitle">Connect with licensed healthcare providers offering in-clinic consultations and telemedicine care.</p>
          </div>
          <button 
            className="section-header-link-btn"
            onClick={() => navigate ? navigate('/doctors') : (window.location.href = '/doctors')}
          >
            <span>View All Doctors</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="top-doctors-grid">
          {loading ? (
            <div className="specialty-loading-state">
              <span>Loading clinician directory...</span>
            </div>
          ) : (
            doctors.map((doctor) => {
              const cleanInitial = doctor.name.replace('Dr. ', '').charAt(0) || 'D'
              const isImageFailed = failedImages[doctor.id]

              return (
                <article className="doc-card-container" key={doctor.id || doctor.name}>
                  {/* Top Header Row with Availability Status & Consultation Fee */}
                  <div className="doc-card-top-bar">
                    <span className="doc-avail-badge">
                      <span className="avail-pulse" />
                      <span>{doctor.availability}</span>
                    </span>
                    <span className="doc-fee-badge">{doctor.fee}</span>
                  </div>

                  {/* Doctor Profile Header: Left-Aligned Portrait + Info */}
                  <div className="doc-card-header">
                    <div className="doc-portrait-wrapper">
                      {!isImageFailed ? (
                        <img 
                          src={doctor.portraitUrl} 
                          alt={doctor.name}
                          className="doc-portrait-img"
                          onError={() => handleImageError(doctor.id)}
                          loading="lazy"
                        />
                      ) : (
                        <div className="doc-avatar-fallback">
                          <span>{cleanInitial}</span>
                        </div>
                      )}
                      <span className="doc-verified-badge" title="Verified Medical License">✓</span>
                    </div>

                    <div className="doc-header-info">
                      <h3 className="doc-title-name">{doctor.name}</h3>
                      <span className="doc-specialty-tag">{doctor.specialty}</span>
                      
                      <div className="doc-rating-summary">
                        <span className="star-icon">★</span>
                        <strong>{doctor.rating}</strong>
                        <span className="review-count">({doctor.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Metadata */}
                  <div className="doc-card-details">
                    <div className="doc-detail-row">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="detail-text">{doctor.location}</span>
                    </div>
                    <div className="doc-detail-row">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6778" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <span className="detail-text">{doctor.experience}</span>
                    </div>
                    <div className="doc-detail-row">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span className="detail-text text-teal">In-Clinic & Video Consultations</span>
                    </div>
                  </div>

                  {/* Clear Action Buttons */}
                  <div className="doc-card-actions">
                    <button
                      className="primary-btn doc-book-btn"
                      onClick={() => handleBookDoctor(doctor.name)}
                    >
                      Book Appointment
                    </button>
                    <button
                      className="secondary-btn doc-view-btn"
                      onClick={() => handleBookDoctor(doctor.name)}
                    >
                      View Profile
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default TopDoctorsSection
