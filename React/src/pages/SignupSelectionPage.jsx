import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'

const SignupSelectionPage = ({ navigate }) => {
  return (
    <div className="auth-page">
      <Navbar onNavigate={navigate} />

      <main className="auth-shell">
        <section className="auth-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <p className="eyebrow" style={{ color: 'var(--teal, #087F72)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Join HealPoint</p>
          <h1 style={{ color: 'var(--navy, #111C2F)', fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Create your account</h1>
          <p className="auth-text" style={{ color: '#5B6778', fontSize: '0.95rem', lineHeight: 1.55, margin: '0 0 24px' }}>
            Choose whether you are booking appointments as a patient or joining our network as a licensed doctor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <button
              className="primary-btn"
              onClick={() => navigate('/signup/patient')}
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>👤</span>
              <span>Register as a Patient</span>
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate('/signup/doctor')}
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>🩺</span>
              <span>Register as a Doctor</span>
            </button>
          </div>

          <p className="auth-switch" style={{ marginTop: '24px', color: '#5B6778', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }} style={{ color: 'var(--teal, #087F72)', fontWeight: 700 }}>
              Log in
            </a>
          </p>
        </section>
      </main>

      <Footer onNavigate={navigate} />
    </div>
  )
}

export default SignupSelectionPage
