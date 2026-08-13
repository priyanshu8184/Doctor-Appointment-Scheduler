import React, { useState } from 'react'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DoctorListingPage from './pages/DoctorListingPage'
import DoctorDashboard from './pages/DoctorDashboard'
import PatientDashboard from './pages/PatientDashboard'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'

const App = () => {
  const [route, setRoute] = useState(window.location.pathname)

  const navigate = (nextRoute) => {
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
  }

  const currentPage = () => {
    if (route === '/login') return <LoginPage navigate={navigate} />
    if (route === '/signup') return <SignupPage navigate={navigate} />
    if (route === '/doctors') return <DoctorListingPage navigate={navigate} />
    if (route === '/services') return <ServicesPage navigate={navigate} />
    if (route === '/about') return <AboutPage navigate={navigate} />
    if (route === '/doctor-dashboard') return <DoctorDashboard />
    if (route === '/patient-dashboard') return <PatientDashboard />
    return <Homepage navigate={navigate} />
  }

  return currentPage()
}

export default App