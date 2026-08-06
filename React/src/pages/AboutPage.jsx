import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AboutPage.css'

const AboutPage = ({ navigate }) => {
  const team = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Medical doctor with 15+ years of experience in healthcare technology.',
    },
    {
      id: 2,
      name: 'Md. Ahmed Khan',
      role: 'Chief Medical Officer',
      bio: 'Experienced physician dedicated to improving patient care through innovation.',
    },
    {
      id: 3,
      name: 'Lisa Chen',
      role: 'CTO',
      bio: 'Tech visionary with expertise in healthcare software and digital solutions.',
    },
  ]

  const milestones = [
    { year: '2020', achievement: 'HealPoint founded with a mission to revolutionize healthcare access.' },
    { year: '2021', achievement: 'Launched doctor listing and appointment booking features.' },
    { year: '2022', achievement: 'Expanded to 50+ cities with 500+ verified doctors.' },
    { year: '2023', achievement: 'Reached 100,000+ patients with successful consultations.' },
    { year: '2024', achievement: 'Introduced online consultation and medical records features.' },
    { year: '2026', achievement: 'Currently serving patients with premium healthcare services.' },
  ]

  const values = [
    {
      title: 'Accessibility',
      description: 'Making quality healthcare accessible to everyone, regardless of location or income.',
    },
    {
      title: 'Quality',
      description: 'Ensuring the highest standards of medical care through verified professionals.',
    },
    {
      title: 'Trust',
      description: 'Building trust through transparency, security, and patient-centric services.',
    },
    {
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology and features.',
    },
  ]

  return (
    <div className="about-page">
      <Navbar onNavigate={navigate} />

      <main className="about-shell">
        <section className="about-header">
          <div>
            <p className="eyebrow">About Us</p>
            <h1>Transforming Healthcare, One Patient at a Time</h1>
            <p className="about-text">
              HealPoint is a digital healthcare platform dedicated to connecting patients with qualified doctors
              and making medical care more accessible, affordable, and convenient for everyone.
            </p>
          </div>
        </section>

        <section className="mission-section">
          <div className="mission-card">
            <h2>Our Mission</h2>
            <p>
              To revolutionize healthcare by providing an easy-to-use, secure, and affordable platform
              that connects patients with qualified healthcare professionals, making quality medical care
              accessible to everyone, anywhere, anytime.
            </p>
          </div>

          <div className="mission-card">
            <h2>Our Vision</h2>
            <p>
              A world where distance, cost, and accessibility are no longer barriers to quality healthcare.
              We envision a future where every person has access to the healthcare they need when they need it.
            </p>
          </div>
        </section>

        <section className="values-section">
          <div>
            <p className="eyebrow">Core Values</p>
            <h2>What Drives Us</h2>
          </div>

          <div className="values-grid">
            {values.map((value, idx) => (
              <div key={idx} className="value-card">
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="timeline-section">
          <div>
            <p className="eyebrow">Our Journey</p>
            <h2>Company Milestones</h2>
          </div>

          <div className="timeline">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <p className="timeline-year">{milestone.year}</p>
                  <p className="timeline-achievement">{milestone.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <div>
            <p className="eyebrow">Leadership</p>
            <h2>Meet Our Team</h2>
            <p className="team-text">
              Our leadership team brings together decades of experience in healthcare, technology, and patient care.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-avatar">{member.name.charAt(0)}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-item">
            <p className="stat-number">100K+</p>
            <p className="stat-label">Patients Served</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">500+</p>
            <p className="stat-label">Verified Doctors</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">50+</p>
            <p className="stat-label">Cities Covered</p>
          </div>
          <div className="stat-item">
            <p className="stat-number">98%</p>
            <p className="stat-label">Patient Satisfaction</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Join the HealPoint Community</h2>
          <p>Whether you're a patient seeking quality care or a doctor looking to expand your practice, we'd love to have you on board.</p>
          <div className="cta-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/signup')}
            >
              Join as Patient
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate('/doctors')}
            >
              Browse Doctors
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
