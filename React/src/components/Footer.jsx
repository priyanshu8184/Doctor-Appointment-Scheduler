import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div>
        <div className="footer-brand">
          <img src="/heelpoint_logo.png" alt="HealPoint logo" className="footer-logo" />
          <h3>HealPoint</h3>
        </div>
        <p>Find trusted doctors and book appointments within Seconds.</p>
      </div>

      <div>
        <h4>Quick Links</h4>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#appointment">Book Appointment</a>
      </div>

      <div>
        <h4>Contact</h4>
        <p>priyanshu@healpoint.com</p>
        <p>+91 9546971110</p>
      </div>
    </footer>
  )
}

export default Footer
