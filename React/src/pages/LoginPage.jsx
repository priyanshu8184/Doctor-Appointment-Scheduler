import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'
import axios from 'axios' 

const LoginPage = ({ navigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const validateField = (name, value) => {
    switch (name) {
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
      setStatusMessage('Logging in...')
      axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}/users/login`, formData)
        .then(response => {
          setStatusMessage('Login successful')
          const user = response.data.user
          localStorage.setItem('user', JSON.stringify(user))
          
          setTimeout(() => {
            const role = user.role ? user.role.toUpperCase() : ''
            if (role === 'ADMIN') {
              navigate('/admin-dashboard')
            } else if (role === 'DOCTOR') {
              navigate('/doctor-dashboard')
            } else {
              navigate('/patient-dashboard')
            }
          }, 1000)
        })
        .catch(error => {
          console.error('Login error:', error)
          if (error.response && error.response.data && error.response.data.message) {
            setStatusMessage(error.response.data.message)
          } else {
            setStatusMessage('Login failed. Please check your credentials.')
          }
        })
    }
  }

  return (
    <div className="auth-page">
      <Navbar onNavigate={navigate} />

      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to HealPoint</h1>
          <p className="auth-text">Access your appointments, doctors, and health updates.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </label>

            <button type="submit" className="primary-btn auth-submit">
              Log In
            </button>
            {statusMessage && <p className="form-status">{statusMessage}</p>}
          </form>

          <p className="auth-switch">
            Don’t have an account?{' '}
            <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup') }}>
              Signup here
            </a>
          </p>
        </section>
      </main>

      <Footer onNavigate={navigate} />
    </div>
  )
}

export default LoginPage
