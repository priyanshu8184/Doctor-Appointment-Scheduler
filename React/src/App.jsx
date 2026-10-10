import React, { useState, useEffect } from 'react'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import SignupSelectionPage from './pages/SignupSelectionPage'
import PatientSignupPage from './pages/PatientSignupPage'
import DoctorSignupPage from './pages/DoctorSignupPage'
import DoctorListingPage from './pages/DoctorListingPage'
import DoctorDashboard from './pages/DoctorDashboard'
import PatientDashboard from './pages/PatientDashboard'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminLoginPage from './pages/AdminLoginPage'

import HealPointAiChat from './components/ai/HealPointAiChat'

const App = () => {
  const [route, setRoute] = useState(window.location.pathname + window.location.search)

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(window.location.pathname + window.location.search)
    }

    // Listen to browser Back / Forward arrow navigation buttons and custom events
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('app-navigate', handleLocationChange)
    window.addEventListener('user-auth-change', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('app-navigate', handleLocationChange)
      window.removeEventListener('user-auth-change', handleLocationChange)
    }
  }, [])

  const navigate = (nextRoute) => {
    const currentFull = window.location.pathname + window.location.search
    if (nextRoute !== currentFull) {
      window.history.pushState({}, '', nextRoute)
      setRoute(nextRoute)
      window.scrollTo(0, 0)
    }
  }

  // Helper to safely get authenticated user & role
  const getAuthUser = () => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      const parsed = JSON.parse(userStr)
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch (e) {
      return null
    }
  }

  const currentPage = () => {
    const authUser = getAuthUser()
    const role = (authUser?.role || '').toUpperCase()
    const isDoctor = role === 'DOCTOR'
    const isAdmin = role === 'ADMIN'
    const isPatient = authUser && role === 'PATIENT'

    const basePath = (route || window.location.pathname).split('?')[0].replace(/\/$/, '')

    // =========================================================================
    // 1. Unauthenticated & Auth Portal Routes
    // =========================================================================
    if (basePath === '/login') return <LoginPage navigate={navigate} />
    if (basePath === '/admin/login') return <AdminLoginPage navigate={navigate} />
    if (basePath === '/signup') return <SignupSelectionPage navigate={navigate} />
    if (basePath === '/signup/patient') return <PatientSignupPage navigate={navigate} />
    if (basePath === '/signup/doctor') return <DoctorSignupPage navigate={navigate} />

    // =========================================================================
    // 2. Role Guards: DOCTOR Authenticated
    // =========================================================================
    if (isDoctor) {
      // If doctor attempts to access patient pages, home, doctor listings, or admin routes
      if (
        basePath === '' || 
        basePath === '/' || 
        basePath === '/home' || 
        basePath === '/doctors' || 
        basePath === '/patient-dashboard' || 
        basePath.startsWith('/patient') ||
        basePath.startsWith('/admin')
      ) {
        return <DoctorDashboard navigate={navigate} />
      }

      if (basePath === '/doctor-dashboard' || basePath.startsWith('/doctor')) {
        return <DoctorDashboard navigate={navigate} />
      }
    }

    // =========================================================================
    // 3. Role Guards: ADMIN Authenticated
    // =========================================================================
    if (isAdmin) {
      // If admin visits patient or doctor routes or homepage
      if (
        basePath === '' || 
        basePath === '/' || 
        basePath === '/home' || 
        basePath === '/doctor-dashboard' || 
        basePath === '/patient-dashboard' || 
        basePath.startsWith('/patient') ||
        basePath.startsWith('/doctor') ||
        basePath === '/doctors'
      ) {
        return <AdminDashboard navigate={navigate} initialTab="overview" />
      }

      // Admin sub-routes
      if (basePath === '/admin' || basePath === '/admin/dashboard' || basePath === '/admin-dashboard') {
        return <AdminDashboard navigate={navigate} initialTab="overview" />
      }
      if (basePath === '/admin/doctors') {
        return <AdminDashboard navigate={navigate} initialTab="doctors" />
      }
      if (basePath === '/admin/patients') {
        return <AdminDashboard navigate={navigate} initialTab="patients" />
      }
      if (basePath === '/admin/appointments') {
        return <AdminDashboard navigate={navigate} initialTab="appointments" />
      }
      if (basePath === '/admin/reports') {
        return <AdminDashboard navigate={navigate} initialTab="reports" />
      }
      if (basePath === '/admin/audit-logs') {
        return <AdminDashboard navigate={navigate} initialTab="audit-logs" />
      }
    }

    // =========================================================================
    // 4. Role Guards: PATIENT Authenticated
    // =========================================================================
    if (isPatient) {
      if (basePath.startsWith('/doctor') || basePath.startsWith('/admin')) {
        return <PatientDashboard navigate={navigate} />
      }
      if (basePath === '/patient-dashboard' || basePath.startsWith('/patient')) {
        return <PatientDashboard navigate={navigate} />
      }
    }

    // =========================================================================
    // 5. Unauthenticated User Guards for Protected Pages
    // =========================================================================
    if (!authUser) {
      if (basePath.startsWith('/doctor') || basePath.startsWith('/patient')) {
        return <LoginPage navigate={navigate} />
      }
      if (basePath.startsWith('/admin')) {
        return <AdminLoginPage navigate={navigate} />
      }
    }

    // =========================================================================
    // 6. Public Pages & Fallback Route
    // =========================================================================
    if (basePath === '/doctors') {
      if (isDoctor) return <DoctorDashboard navigate={navigate} />
      if (isAdmin) return <AdminDashboard navigate={navigate} />
      return <DoctorListingPage navigate={navigate} />
    }
    if (basePath === '/services') return <ServicesPage navigate={navigate} />
    if (basePath === '/about') return <AboutPage navigate={navigate} />
    if (basePath.startsWith('/patient')) {
      if (isDoctor) return <DoctorDashboard navigate={navigate} />
      if (isAdmin) return <AdminDashboard navigate={navigate} />
      if (!authUser) return <LoginPage navigate={navigate} />
      return <PatientDashboard navigate={navigate} />
    }
    if (basePath.startsWith('/doctor')) {
      if (!isDoctor) return <LoginPage navigate={navigate} />
      return <DoctorDashboard navigate={navigate} />
    }

    if (isDoctor) return <DoctorDashboard navigate={navigate} />
    if (isAdmin) return <AdminDashboard navigate={navigate} />
    return <Homepage navigate={navigate} />
  }

  return (
    <>
      {currentPage()}
      <HealPointAiChat navigate={navigate} />
    </>
  )
}

export default App