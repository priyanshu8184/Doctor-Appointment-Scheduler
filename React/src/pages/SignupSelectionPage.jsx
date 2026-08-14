import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'

const SignupSelectionPage = ({ navigate }) => {
  return (
    <div className="auth-page">
      <Navbar onNavigate={navigate} />

      <main className="auth-shell">
        <section className="auth-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="eyebrow">Join HealPoint</p>
          <h1>You're a</h1>
          <p className="auth-text" style={{ marginBottom: '30px' }}>

          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <button
              className="primary-btn"
              onClick={() => navigate('/signup/patient')}
              style={{ width: '100%', maxWidth: '300px', padding: '15px', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              Patient
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate('/signup/doctor')}
              style={{ width: '100%', maxWidth: '300px', padding: '15px', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              Doctor
            </button>
          </div>

          <p className="auth-switch" style={{ marginTop: '30px' }}>
            Already have an account?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
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
