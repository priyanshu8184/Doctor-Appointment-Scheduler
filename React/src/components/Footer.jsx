import React from 'react'

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div>
        <div className="footer-brand">
          <img src="/heelpoint_logo.png" alt="HealPoint logo" className="footer-logo" />
          <h3>HealPoint</h3>
        </div>
        <p>Find trusted doctors and reserve appointments in minutes.</p>
      </div>

      <div>
        <h4>Quick Links</h4>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#appointment">Book Appointment</a>
      </div>

      <div>
        <h4>Contact</h4>
        <p>contact@healpoint.com</p>
        <p>+1 (800) 555-0142</p>
      </div>
    </footer>
  )
}

export default Footer
