import React, { useState } from 'react'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const App = () => {
  const [route, setRoute] = useState(window.location.pathname)

  const navigate = (nextRoute) => {
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
  }

  const currentPage = () => {
    if (route === '/login') return <LoginPage navigate={navigate} />
    if (route === '/signup') return <SignupPage navigate={navigate} />
    return <Homepage navigate={navigate} />
  }

  return currentPage()
}

export default App