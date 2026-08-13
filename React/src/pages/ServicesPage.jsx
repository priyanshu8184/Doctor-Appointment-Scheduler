import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './ServicesPage.css'

const ServicesPage = ({ navigate }) => {
  // Define states for services and features
  const [services, setServices] = useState([])
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, you could fetch this marketing data from a backend CMS or configuration API.
    // For now, we simulate a fetch from the local static configuration:
    const loadServicesData = () => {
      const servicesData = [
        {
          id: 1,
          icon: '🔍',
          title: 'Find Doctors',
          description: 'Search and discover highly qualified doctors across various specializations in your area.',
          path: '/doctors'
        },
        {
          id: 2,
          icon: '📅',
          title: 'Book Appointments',
          description: 'Schedule appointments with your preferred doctors at times that work best for you.',
          path: '/doctors'
        },
        {
          id: 3,
          icon: '💬',
          title: 'Online Consultation',
          description: 'Connect with doctors remotely via video call for convenient medical consultations.',
          path: '/patient-dashboard'
        },
        {
          id: 4,
          icon: '📋',
          title: 'Medical Records',
          description: 'Securely store and manage your medical history, prescriptions, and test results in one place.',
          path: '/patient-dashboard'
        },
        {
          id: 5,
          icon: '💊',
          title: 'Prescription Management',
          description: 'Access your prescriptions digitally and get reminders for medication refills.',
          path: '/patient-dashboard'
        },
        {
          id: 6,
          icon: '⭐',
          title: 'Doctor Reviews',
          description: 'Read authentic reviews from patients and make informed decisions about your healthcare.',
          path: '/patient-dashboard'
        },
      ]

      const featuresData = [
        {
          title: 'Verified Professionals',
          description: 'All doctors on our platform are verified healthcare professionals with valid credentials.',
        },
        {
          title: 'Easy Scheduling',
          description: 'Intuitive appointment booking with instant confirmation and reminders.',
        },
        {
          title: 'Secure & Private',
          description: 'Your health data is encrypted and protected with industry-standard security.',
        },
        {
          title: '24/7 Support',
          description: 'Our dedicated support team is available around the clock to assist you.',
        },
      ]

      setServices(servicesData)
      setFeatures(featuresData)
      setLoading(false)
    }

    loadServicesData()
  }, [])

  const handleServiceClick = (path) => {
    if (path === '/patient-dashboard') {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      if (!user) {
        navigate('/login')
        return
      }
      if (user.role === 'DOCTOR') {
        navigate('/doctor-dashboard')
        return
      }
    }
    navigate(path)
  }

  return (
    <div className="services-page">
      <Navbar onNavigate={navigate} />

      <main className="services-shell">
        <section className="services-header">
          <div>
            <p className="eyebrow">Our Offerings</p>
            <h1>Comprehensive Healthcare Solutions</h1>
            <p className="services-text">HealPoint provides a complete suite of digital healthcare services to connect patients with qualified doctors and manage their health efficiently.</p>
          </div>
        </section>

        <section className="services-grid">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="service-card clickable" 
              onClick={() => handleServiceClick(service.path)}
              role="button"
              tabIndex={0}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </section>

        <section className="features-section">
          <div>
            <p className="eyebrow">Why Choose Us</p>
            <h2>What Makes HealPoint Different</h2>
            <p className="features-text">We're committed to making healthcare accessible, affordable, and convenient for everyone.</p>
          </div>

          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of patients and doctors using HealPoint for better healthcare management.</p>
            <div className="cta-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate('/signup')}
              >
                Sign Up Today
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate('/doctors')}
              >
                Browse Doctors
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ServicesPage
