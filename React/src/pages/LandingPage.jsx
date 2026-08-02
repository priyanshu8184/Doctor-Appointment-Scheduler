import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './LandingPage.css'

const services = [
  {
    title: 'Find Specialists',
    text: 'Search by specialty, location, and availability in one place.'
  },
  {
    title: 'Book Instantly',
    text: 'Choose convenient time slots and confirm appointments online.'
  },
  {
    title: 'Stay Informed',
    text: 'Receive reminders and follow-up guidance from your care team.'
  }
]

const benefits = [
  'Verified doctors and clinics',
  'Same-day and next-day availability',
  'Secure digital health records'
]

const LandingPage = () => {
  return (
    <div className="landing-page" id="home">
      <Navbar />

      <main>
        <section className="hero-section" id="appointment">
          <div className="hero-copy">
            <p className="eyebrow">Healthcare made simple</p>
            <h1>Your health journey starts with HealPoint.</h1>
            <p className="hero-text">
              Book trusted medical appointments online, discover top specialists,
              and feel confident about every visit.
            </p>

            <div className="hero-actions">
              <a className="primary-btn" href="#appointment">Book an Appointment</a>
              <a className="secondary-btn" href="#about">Learn More</a>
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

        <section className="features-section" id="services">
          <div className="section-heading">
            <p className="eyebrow">Why patients choose us</p>
            <h2>Everything you need for a better care experience.</h2>
          </div>

          <div className="cards-grid">
            {services.map((service) => (
              <article className="info-card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-copy">
            <p className="eyebrow">Built for modern care</p>
            <h2>Simple, fast, and dependable from start to finish.</h2>
            <p>
              HealPoint connects patients with experienced professionals and helps
              them manage visits without the usual stress.
            </p>
          </div>

          <div className="benefits-card">
            {benefits.map((item) => (
              <div className="benefit-item" key={item}>
                <span>✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
