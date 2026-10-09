import React from 'react'
import './Footer.css'

const Footer = ({ onNavigate }) => {
  const handleNavigate = (nextRoute) => {
    if (onNavigate) {
      onNavigate(nextRoute)
      return
    }

    window.history.pushState({}, '', nextRoute)
    window.dispatchEvent(new Event('app-navigate'))
  }

  return (
    <footer className="footer-wrapper" id="contact">
      <div className="footer-top-container">
        {/* Column 1: Brand & Tagline */}
        <div className="footer-brand-col">
          <a href="/" className="footer-logo-link" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>
            <img src="/heelpoint_logo.png" alt="HealPoint" className="footer-logo-img" />
          </a>
          <p className="footer-tagline">Trusted healthcare, made simple.</p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-list">
            <li><a href="/" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>Home</a></li>
            <li><a href="/services" onClick={(e) => { e.preventDefault(); handleNavigate('/services') }}>Services</a></li>
            <li><a href="/about" onClick={(e) => { e.preventDefault(); handleNavigate('/about') }}>About</a></li>
            <li><a href="/doctors" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors') }}>Find Doctors</a></li>
            <li><a href="/login" onClick={(e) => { e.preventDefault(); handleNavigate('/login') }}>Login</a></li>
          </ul>
        </div>

        {/* Column 3: Specialties */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Specialties</h4>
          <ul className="footer-list">
            <li><a href="/doctors?specialization=General%20Medicine" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors?specialization=General%20Medicine') }}>General Medicine</a></li>
            <li><a href="/doctors?specialization=Cardiologist" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors?specialization=Cardiologist') }}>Cardiology</a></li>
            <li><a href="/doctors?specialization=Dermatologist" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors?specialization=Dermatologist') }}>Dermatology</a></li>
            <li><a href="/doctors?specialization=Neurologist" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors?specialization=Neurologist') }}>Neurology</a></li>
            <li><a href="/doctors?specialization=Pediatrician" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors?specialization=Pediatrician') }}>Pediatrics</a></li>
          </ul>
        </div>

        {/* Column 4: Contact & Subtle Emergency Notice */}
        <div className="footer-contact-col">
          <h4 className="footer-heading">Contact</h4>
          <div className="footer-contact-item">
            <span className="contact-label">Support</span>
            <a href="mailto:priyanshu@healpoint.com" className="contact-val">priyanshu@healpoint.com</a>
          </div>
          <div className="footer-contact-item">
            <span className="contact-label">Helpline</span>
            <a href="tel:+919546971110" className="contact-val">+91 9546971110</a>
          </div>
          <div className="footer-emergency-compact">
            <span className="emergency-dot" />
            <span>Medical Emergency? <a href="tel:112" className="emergency-call-link">Call 112</a></span>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">© {new Date().getFullYear()} HealPoint Healthcare Technologies. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="/about" onClick={(e) => { e.preventDefault(); handleNavigate('/about') }} className="legal-link">Privacy Policy</a>
            <span className="legal-dot">•</span>
            <a href="/about" onClick={(e) => { e.preventDefault(); handleNavigate('/about') }} className="legal-link">Terms of Service</a>
            <span className="legal-dot">•</span>
            <span className="legal-link">Medical Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
