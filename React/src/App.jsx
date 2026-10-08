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

import HealPointAiChat from './components/ai/HealPointAiChat'

const App = () => {
  const [route, setRoute] = useState(window.location.pathname + window.location.search)

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(window.location.pathname + window.location.search)
    }

    // Listen to browser Back / Forward arrow navigation buttons
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('app-navigate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('app-navigate', handleLocationChange)
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

  const currentPage = () => {
    const basePath = (route || window.location.pathname).split('?')[0]
    if (basePath === '/login') return <LoginPage navigate={navigate} />
    if (basePath === '/signup') return <SignupSelectionPage navigate={navigate} />
    if (basePath === '/signup/patient') return <PatientSignupPage navigate={navigate} />
    if (basePath === '/signup/doctor') return <DoctorSignupPage navigate={navigate} />
    if (basePath === '/doctors') return <DoctorListingPage navigate={navigate} />
    if (basePath === '/services') return <ServicesPage navigate={navigate} />
    if (basePath === '/about') return <AboutPage navigate={navigate} />
    if (basePath === '/doctor-dashboard') return <DoctorDashboard navigate={navigate} />
    if (basePath === '/patient-dashboard') return <PatientDashboard navigate={navigate} />
    if (basePath === '/admin-dashboard') return <AdminDashboard navigate={navigate} />
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