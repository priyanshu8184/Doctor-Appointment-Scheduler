import React from 'react'

const testimonials = [
  { 
    name: 'Amit Raj', 
    initials: 'AR',
    city: 'Indore',
    department: 'Dermatology Consultation',
    rating: 5,
    quote: 'Doctor was extremely thorough and attentive. My skin condition was accurately diagnosed and the digital prescription was available immediately in my dashboard.' 
  },
  { 
    name: 'Ajay G. Goswami', 
    initials: 'AG',
    city: 'Varanasi',
    department: 'Cardiology Checkup',
    rating: 5,
    quote: 'Booking a same-day slot was seamless without having to wait in clinic queues. The doctor explained my ECG results with great clarity.' 
  },
  { 
    name: 'Atharv Navlakhe', 
    initials: 'AN',
    city: 'Bhopal',
    department: 'General Primary Care',
    rating: 5,
    quote: 'The video consultation worked straight from my phone browser without downloading extra apps. Very professional clinician and helpful follow-up notes.' 
  }
]

const TestimonialsSection = () => {
  return (
    <section className="testimonials-section-wrapper" id="testimonials">
      <div className="section-container">
        <div className="section-header-center">
          <span className="section-eyebrow">Patient Experiences</span>
          <h2 className="section-title">Trusted by patients across India</h2>
          <p className="section-subtitle">Real feedback from verified patients who booked and attended care through HealPoint.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, idx) => (
            <div className="testimonial-card" key={idx}>
              <div className="testimonial-rating-row">
                <div className="stars-cluster">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="star-icon">★</span>
                  ))}
                </div>
                <span className="verified-patient-tag">
                  <span className="check-icon">✓</span> Verified Visit
                </span>
              </div>

              <p className="testimonial-quote-text">“{item.quote}”</p>

              <div className="testimonial-patient-row">
                <div className="patient-avatar-box">
                  <span>{item.initials}</span>
                </div>
                <div className="patient-meta">
                  <h4 className="patient-name">{item.name}</h4>
                  <p className="patient-location">{item.city} • {item.department}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
