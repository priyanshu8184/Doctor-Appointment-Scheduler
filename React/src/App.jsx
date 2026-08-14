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
    const basePath = route.split('?')[0]
    if (basePath === '/login') return <LoginPage navigate={navigate} />
    if (basePath === '/signup') return <SignupPage navigate={navigate} />
    if (basePath === '/doctors') return <DoctorListingPage navigate={navigate} />
    if (basePath === '/services') return <ServicesPage navigate={navigate} />
    if (basePath === '/about') return <AboutPage navigate={navigate} />
    if (basePath === '/doctor-dashboard') return <DoctorDashboard navigate={navigate} />
    if (basePath === '/patient-dashboard') return <PatientDashboard navigate={navigate} />
    return <Homepage navigate={navigate} />
  }

  return currentPage()
}

export default App