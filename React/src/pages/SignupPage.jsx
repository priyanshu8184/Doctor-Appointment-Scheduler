import React, { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './AuthPage.css'

const SignupPage = ({ navigate }) => {
  const [role, setRole] = useState('PATIENT') // 'PATIENT' or 'DOCTOR'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '', // for patient
    phone: '',       // for patient
    bio: '',         // for doctor
    location: '',    // for doctor
    specialization: '', // for doctor
    consultationFee: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    education: '',
    doctorPhone: '',
    experience: ''
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
      case 'dateOfBirth': {
        if (role === 'PATIENT' && !value) return 'Date of Birth is required.'
        return ''
      }
      case 'consultationFee': {
        if (role === 'DOCTOR') {
          if (!value) return 'Consultation fee is required.'
          if (isNaN(value) || Number(value) <= 0) return 'Please enter a valid positive number.'
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
      if (role === 'DOCTOR' && !certificateFile) {
        setStatusMessage('MBBS Certificate is required for Doctor registration.')
        return
      }

      setStatusMessage('Creating account...')
      
      const payload = {
        email: formData.email,
        password: formData.password,
        role: role // 'PATIENT' or 'DOCTOR'
      }

      const BACKEND_BASE =
        import.meta?.env?.VITE_BACKEND_BASE_URL || import.meta?.env?.BACKEND_BASE_URL || 'http://localhost:3001/api'

      axios
        .post(`${BACKEND_BASE}/users/register`, payload)
        .then((res) => {
          if (res.status === 201) {
            const userId = res.data.user.user_id

            // Step 2: Create patient or doctor profile
            if (role === 'PATIENT') {
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

              if (profilePicture) {
                doctorPayload.append('profile_picture', profilePicture);
              }
              if (certificateFile) {
                doctorPayload.append('certificate', certificateFile);
              }

              return axios.post(`${BACKEND_BASE}/doctors`, doctorPayload, { headers: { 'Content-Type': 'multipart/form-data' } })
            }
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
          <h1>Create your account</h1>
          <p className="auth-text">Book appointments, manage care, and stay connected to your doctors.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group role-selector" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="PATIENT"
                  checked={role === 'PATIENT'}
                  onChange={() => {
                    setRole('PATIENT')
                    setErrors({})
                  }}
                />
                Register as Patient
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="DOCTOR"
                  checked={role === 'DOCTOR'}
                  onChange={() => {
                    setRole('DOCTOR')
                    setErrors({})
                  }}
                />
                Register as Doctor
              </label>
            </div>

            {/* Profile Picture Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#f1f5f9', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '10px', border: '2px dashed #cbd5e1'
              }}>
                {previewImage ? (
                  <img src={previewImage} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '2rem' }}>📷</span>
                )}
              </div>
              <label style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 500, fontSize: '0.9rem' }}>
                Upload Profile Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ flex: 1 }}>
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

              <label style={{ flex: 1 }}>
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

            {role === 'PATIENT' ? (
              <>
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

                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ flex: 1 }}>
                    Phone Number
                    <input
                      type="tel"
                      name="phone"
                      placeholder="123-456-7890"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </label>

                  <label style={{ flex: 1 }}>
                    Gender
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ flex: 1 }}>
                    Blood Group
                    <input
                      type="text"
                      name="bloodGroup"
                      placeholder="e.g. O+"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    />
                  </label>
                  <label style={{ flex: 1 }}>
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
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </>
            ) : (
              <>
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

                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ flex: 1 }}>
                    Phone Number
                    <input
                      type="tel"
                      name="doctorPhone"
                      placeholder="e.g. 9876543210"
                      value={formData.doctorPhone}
                      onChange={handleChange}
                    />
                  </label>

                  <label style={{ flex: 1 }}>
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
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
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
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#fff'
                    }}
                  />
                  {!certificateFile && <p className="field-error" style={{marginTop: '4px'}}>Certificate is mandatory to proceed as a doctor.</p>}
                </div>
              </>
            )}

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

export default SignupPage
