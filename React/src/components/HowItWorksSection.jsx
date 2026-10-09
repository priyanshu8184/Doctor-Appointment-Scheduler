import React from 'react'

const steps = [
  {
    stepNumber: '01',
    title: 'Find & Compare Providers',
    desc: 'Search board-certified doctors by specialty, symptoms, verified patient ratings, consultation fees, or nearby clinic locations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )
  },
  {
    stepNumber: '02',
    title: 'Select Verified Time Slot',
    desc: 'Choose an exact appointment time that fits your calendar. Opt for an in-person clinic visit or a secure one-click video consultation.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    stepNumber: '03',
    title: 'Receive Care & Digital Rx',
    desc: 'Attend your consultation with zero waiting room hassle. Receive your official digital prescription and care notes instantly in your dashboard.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  }
]

const HowItWorksSection = ({ navigate }) => {
  return (
    <section className="how-it-works-section-wrapper" id="how-it-works">
      <div className="section-container">
        <div className="section-header-center">
          <span className="section-eyebrow">Simple & Streamlined</span>
          <h2 className="section-title">How HealPoint works for patients</h2>
          <p className="section-subtitle">Get connected with top medical specialists in three effortless steps.</p>
        </div>

        <div className="steps-flow-grid">
          {steps.map((step, idx) => (
            <div className="step-flow-card" key={idx}>
              <div className="step-card-header">
                <div className="step-badge-number">{step.stepNumber}</div>
                <div className="step-icon-bubble">{step.icon}</div>
              </div>
              <h3 className="step-flow-title">{step.title}</h3>
              <p className="step-flow-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="how-it-works-footer-cta">
          <button 
            className="primary-btn steps-cta-btn"
            onClick={() => navigate ? navigate('/doctors') : (window.location.href = '/doctors')}
          >
            <span>Book an Appointment Today</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
