import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'
import axios from 'axios' 

const LoginPage = ({ navigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

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
      axios.post('http://localhost:3001/api/users/login', formData)
        .then(response => {
          setStatusMessage('Login successful')
          const user = response.data.user
          localStorage.setItem('user', JSON.stringify(user))
          
          setTimeout(() => {
            // Role is saved in uppercase (DOCTOR, PATIENT) from database
            if (user.role === 'DOCTOR') {
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
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                autoComplete="current-password"
              />
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
