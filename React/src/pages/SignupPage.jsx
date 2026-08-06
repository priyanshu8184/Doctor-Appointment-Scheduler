import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'

const SignupPage = ({ navigate }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName': {
        const trimmed = value.trim()
        if (!trimmed) return 'Full name is required.'
        if (trimmed.length < 2) return 'Name must be at least 2 characters.'
        if (!/^[A-Za-z\s'-]+$/.test(trimmed)) return 'Name can only contain letters, spaces, apostrophes, or hyphens.'
        return ''
      }
      case 'email': {
        const trimmed = value.trim()
        if (!trimmed) return 'Email is required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.'
        return ''
      }
      case 'password': {
        if (!value) return 'Password is required.'
        if (value.length < 8) return 'Password must be at least 8 characters.'
        if (/\s/.test(value)) return 'Password cannot contain spaces.'
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*]/.test(value)) {
          return 'Use uppercase, lowercase, a number, and a special character.'
        }
        return ''
      }
      default:
        return ''
    }
  }

  const validateForm = (values) => {
    const nextErrors = {}

    Object.entries(values).forEach(([name, value]) => {
      const error = validateField(name, value)
      if (error) nextErrors[name] = error
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextValues = { ...formData, [name]: value }

    setFormData(nextValues)
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }))
    setStatusMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (validateForm(formData)) {
      setStatusMessage('Perfect. Your account details look valid.')
    }
  }

  return (
    <div className="auth-page">
      <Navbar onNavigate={navigate} />

      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Join HealPoint</p>
          <h1>Create your account</h1>
          <p className="auth-text">Book appointments, manage care, and stay connected to your doctors.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label>
              Full name
              <input
                type="text"
                name="fullName"
                placeholder="Your name"
                value={formData.fullName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.fullName)}
                autoComplete="name"
              />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                autoComplete="new-password"
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </label>

            <button type="submit" className="primary-btn auth-submit">
              Sign Up
            </button>
            {statusMessage && <p className="form-status">{statusMessage}</p>}
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
              Log in
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default SignupPage
