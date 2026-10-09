import React from 'react'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: 'Strictly Verified Practitioners',
    desc: 'Every doctor undergoes manual credential and medical council license verification before being listed.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Zero-Wait Hybrid Appointments',
    desc: 'Book exact 30-minute consultation slots for either in-clinic visits or secure browser-based video calls.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'AI Lab Diagnostics & Digital Records',
    desc: 'Instant explanation of complex lab parameters and secure lifetime storage for digital prescriptions.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#087F72" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    title: 'Transparent Pricing & Auto-Refunds',
    desc: 'Clear upfront consultation fees with automated refund processing if you cancel up to 2 hours in advance.'
  }
]

const WhyChooseUsSection = ({ navigate }) => {
  return (
    <section className="why-us-section-wrapper" id="why-choose-us">
      <div className="section-container">
        <div className="why-us-layout">
          <div className="why-us-left-content">
            <span className="section-eyebrow">The HealPoint Difference</span>
            <h2 className="why-us-title">Healthcare engineered for patient trust and clinical clarity.</h2>
            <p className="why-us-lead-text">
              We eliminated long waiting rooms, opaque pricing, and confusing medical jargon to build a patient-first healthcare ecosystem.
            </p>

            <div className="why-us-features-list">
              {features.map((feat, idx) => (
                <div className="why-us-feat-row" key={idx}>
                  <div className="why-feat-icon-box">{feat.icon}</div>
                  <div className="why-feat-text">
                    <h3 className="why-feat-heading">{feat.title}</h3>
                    <p className="why-feat-body">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="why-us-cta-row">
              <button 
                className="primary-btn why-cta-btn"
                onClick={() => navigate ? navigate('/signup') : (window.location.href = '/signup')}
              >
                Create Free Patient Account
              </button>
            </div>
          </div>

          <div className="why-us-right-panel">
            <div className="trust-infographic-card">
              <div className="infographic-badge">
                <span className="shield-icon">🛡️</span>
                <span>Clinical Standard of Care</span>
              </div>
              
              <div className="trust-stat-box">
                <span className="stat-large">99.4%</span>
                <span className="stat-label">On-time consultation rate across registered clinics</span>
              </div>

              <div className="trust-checklist">
                <div className="check-row">
                  <span className="check-mark">✓</span>
                  <span>End-to-End Encrypted Telemedicine Consultations</span>
                </div>
                <div className="check-row">
                  <span className="check-mark">✓</span>
                  <span>Direct Integration with Verified Pathology Labs</span>
                </div>
                <div className="check-row">
                  <span className="check-mark">✓</span>
                  <span>Instant SMS & Email Calendar Reminders</span>
                </div>
                <div className="check-row">
                  <span className="check-mark">✓</span>
                  <span>Full Patient Data Confidentiality & Consent Control</span>
                </div>
              </div>

              <div className="trust-card-footer">
                <div className="accreditation-pill">
                  <span>HIPAA & MCI Guideline Compliant Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection
