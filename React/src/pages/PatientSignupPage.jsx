import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'

const PatientSignupPage = ({ navigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProfilePicture(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName': {
        const trimmed = value.trim()
        if (!trimmed) return 'First name is required.'
        if (trimmed.length < 2) return 'Name must be at least 2 characters.'
        return ''
      }
      case 'lastName': {
        const trimmed = value.trim()
        if (!trimmed) return 'Last name is required.'
        if (trimmed.length < 2) return 'Name must be at least 2 characters.'
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
      case 'dateOfBirth': {
        if (!value) return 'Date of Birth is required.'
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
      setStatusMessage('Creating account...')
      
      const payload = {
        email: formData.email,
        password: formData.password,
        role: 'PATIENT'
      }

      const BACKEND_BASE =
        import.meta?.env?.VITE_BACKEND_BASE_URL || import.meta?.env?.BACKEND_BASE_URL || 'http://localhost:3001/api'

      axios
        .post(`${BACKEND_BASE}/users/register`, payload)
        .then((res) => {
          if (res.status === 201) {
            const userId = res.data.user.user_id

            const patientPayload = new FormData();
            patientPayload.append('patient_id', userId);
            patientPayload.append('user_id', userId);
            patientPayload.append('first_name', formData.firstName);
            patientPayload.append('last_name', formData.lastName);
            patientPayload.append('date_of_birth', formData.dateOfBirth);
            patientPayload.append('phone_number', formData.phone || '');
            patientPayload.append('gender', formData.gender || '');
            patientPayload.append('blood_group', formData.bloodGroup || '');
            patientPayload.append('address', formData.address || '');
            patientPayload.append('emergency_contact', formData.emergencyContact || '');
            
            if (profilePicture) {
              patientPayload.append('profile_picture', profilePicture);
            }

            return axios.post(`${BACKEND_BASE}/patients`, patientPayload, { headers: { 'Content-Type': 'multipart/form-data' } })
          } else {
            throw new Error((res.data && res.data.message) || 'Registration failed')
          }
        })
        .then(() => {
          setStatusMessage('Account and profile created successfully. Redirecting to login...')
          setTimeout(() => navigate('/login'), 1500)
        })
        .catch((err) => {
          console.error('Signup error:', err)
          if (err.response && err.response.data && err.response.data.message) {
            setStatusMessage(err.response.data.message)
          } else {
            setStatusMessage(err.message || 'Network error — please try again later')
          }
        })
    }
  }

  return (
    <div className="auth-page">
      <Navbar onNavigate={navigate} />

      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Join HealPoint</p>
          <h1>Register as a Patient</h1>
          <p className="auth-text">Book appointments, manage care, and stay connected to your doctors.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
            {/* Profile Picture Upload */}
            <div className="auth-profile-upload-container">
              <div className="auth-profile-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Profile Preview" className="auth-profile-preview-img" />
                ) : (
                  <span className="auth-profile-placeholder">📷</span>
                )}
              </div>
              <label className="auth-profile-label">
                Upload Profile Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
            </div>

            <div className="auth-row">
              <label className="auth-flex-item">
                First name
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.firstName)}
                />
                {errors.firstName && <p className="field-error">{errors.firstName}</p>}
              </label>

              <label className="auth-flex-item">
                Last name
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.lastName)}
                />
                {errors.lastName && <p className="field-error">{errors.lastName}</p>}
              </label>
            </div>

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

            <label>
              Date of Birth
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                aria-invalid={Boolean(errors.dateOfBirth)}
              />
              {errors.dateOfBirth && <p className="field-error">{errors.dateOfBirth}</p>}
            </label>

            <div className="auth-row">
              <label className="auth-flex-item">
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  placeholder="123-456-7890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>

              <label className="auth-flex-item">
                Gender
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="auth-row">
              <label className="auth-flex-item">
                Blood Group
                <input
                  type="text"
                  name="bloodGroup"
                  placeholder="e.g. O+"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                />
              </label>
              <label className="auth-flex-item">
                Emergency Contact
                <input
                  type="text"
                  name="emergencyContact"
                  placeholder="Name / Number"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              Address
              <textarea
                name="address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="auth-textarea-custom"
              />
            </label>

            <button type="submit" className="primary-btn auth-submit" style={{ marginTop: '10px' }}>
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

      <Footer onNavigate={navigate} />
    </div>
  )
}

export default PatientSignupPage
