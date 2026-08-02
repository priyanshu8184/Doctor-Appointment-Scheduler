import React from 'react'

const HeroSection = () => {
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
          <a className="primary-btn" href="#search-doctor">Book an Appointment</a>
          <a className="secondary-btn" href="#why-choose-us">Learn More</a>
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

      <div className="hero-card" aria-label="Appointment preview">
        <div className="card-top">
          <span className="card-badge">Available Today</span>
          <h3>Dr. Maya Chen</h3>
          <p>General Physician • 2:30 PM</p>
        </div>

        <div className="card-body">
          <div className="mini-pill">Online consultation</div>
          <div className="mini-pill">Same-day booking</div>
          <div className="mini-pill">Insurance accepted</div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
