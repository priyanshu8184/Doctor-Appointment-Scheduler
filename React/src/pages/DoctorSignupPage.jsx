import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'

const DoctorSignupPage = ({ navigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    bio: '',
    location: '',
    specialization: '',
    consultationFee: '',
    education: '',
    doctorPhone: '',
    experience: '',
    medicalLicenseNumber: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [certificateFile, setCertificateFile] = useState(null)
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
      case 'consultationFee': {
        if (!value) return 'Consultation fee is required.'
        if (isNaN(value) || Number(value) <= 0) return 'Please enter a valid positive number.'
        return ''
      }
      case 'medicalLicenseNumber': {
        const trimmed = value.trim()
        if (!trimmed) return 'Medical license number is required.'
        // Regex for Indian Medical Council: 2-6 letters, optional separator (- / space), 3-7 digits
        const mciRegex = /^[A-Z]{2,6}[-/\s]?\d{3,7}$/i
        if (!mciRegex.test(trimmed)) {
          return 'Invalid format. Use Indian format (e.g., MCI-12345, DMC/1234)'
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
      if (!certificateFile) {
        setStatusMessage('MBBS Certificate is required for Doctor registration.')
        return
      }

      setStatusMessage('Creating account...')
      
      const payload = {
        email: formData.email,
        password: formData.password,
        role: 'DOCTOR'
      }

      const BACKEND_BASE =
        import.meta?.env?.VITE_BACKEND_BASE_URL || import.meta?.env?.BACKEND_BASE_URL || `${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}`

      axios
        .post(`${BACKEND_BASE}/users/register`, payload)
        .then((res) => {
          if (res.status === 201) {
            const userId = res.data.user.user_id

            const doctorPayload = new FormData();
            doctorPayload.append('doctor_id', userId);
            doctorPayload.append('user_id', userId);
            doctorPayload.append('first_name', formData.firstName);
            doctorPayload.append('last_name', formData.lastName);
            doctorPayload.append('bio', formData.bio || '');
            doctorPayload.append('location', formData.location || '');
            doctorPayload.append('specialization', formData.specialization || 'General Medicine');
            doctorPayload.append('consultation_fee', Number(formData.consultationFee));
            doctorPayload.append('education', formData.education || '');
            doctorPayload.append('phone_number', formData.doctorPhone || '');
            doctorPayload.append('experience', formData.experience || '');
            doctorPayload.append('medical_license_number', formData.medicalLicenseNumber);

            if (profilePicture) {
              doctorPayload.append('profile_picture', profilePicture);
            }
            if (certificateFile) {
              doctorPayload.append('certificate', certificateFile);
            }

            return axios.post(`${BACKEND_BASE}/doctors`, doctorPayload, { headers: { 'Content-Type': 'multipart/form-data' } })
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
          <h1>Register as a Doctor</h1>
          <p className="auth-text">Provide care, manage appointments, and connect with patients securely.</p>

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
              Medical License Number *
              <input
                type="text"
                name="medicalLicenseNumber"
                placeholder="Enter your medical license number"
                value={formData.medicalLicenseNumber}
                onChange={handleChange}
                aria-invalid={Boolean(errors.medicalLicenseNumber)}
              />
              {errors.medicalLicenseNumber && <p className="field-error">{errors.medicalLicenseNumber}</p>}
            </label>

            <label>
              Location / Clinic Location
              <input
                type="text"
                name="location"
                placeholder="e.g. Indore, Madhya Pradesh"
                value={formData.location}
                onChange={handleChange}
              />
            </label>

            <div className="auth-row">
              <label className="auth-flex-item">
                Phone Number
                <input
                  type="tel"
                  name="doctorPhone"
                  placeholder="e.g. 9876543210"
                  value={formData.doctorPhone}
                  onChange={handleChange}
                />
              </label>

              <label className="auth-flex-item">
                Experience
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 5+ years"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              Education / Qualifications
              <input
                type="text"
                name="education"
                placeholder="e.g. MBBS, MD - Dermatology"
                value={formData.education}
                onChange={handleChange}
              />
            </label>

            <label>
              Specialty
              <select name="specialization" value={formData.specialization} onChange={handleChange}>
                <option value="">Select Specialty</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
              </select>
            </label>

            <label>
              Consultation Fee (₹)
              <input
                type="number"
                name="consultationFee"
                placeholder="e.g. 500"
                value={formData.consultationFee}
                onChange={handleChange}
                aria-invalid={Boolean(errors.consultationFee)}
              />
              {errors.consultationFee && <p className="field-error">{errors.consultationFee}</p>}
            </label>

            <label>
              Professional Biography
              <textarea
                name="bio"
                placeholder="Tell us about your medical background..."
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="auth-textarea-custom"
              />
            </label>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                MBBS Certificate (Required) *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setCertificateFile(e.target.files[0])}
                className="auth-file-input"
              />
              {!certificateFile && <p className="field-error" style={{marginTop: '4px'}}>Certificate is mandatory to proceed as a doctor.</p>}
            </div>

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

export default DoctorSignupPage
