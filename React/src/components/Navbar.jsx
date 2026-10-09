import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'

const Navbar = ({ onNavigate }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isDoctor = user?.role === 'DOCTOR'
  const isAdmin = user?.role === 'ADMIN'

  const currentPath = window.location.pathname

  useEffect(() => {
    const onOutside = (e) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [open])

  const handleNavigate = (nextRoute) => {
    setOpen(false)

    if (onNavigate) {
      onNavigate(nextRoute)
      return
    }

    window.history.pushState({}, '', nextRoute)
    window.dispatchEvent(new Event('app-navigate'))
  }

  const getDashboardPath = () => {
    if (isAdmin) return '/admin-dashboard'
    if (isDoctor) return '/doctor-dashboard'
    return '/patient-dashboard'
  }

  const isHomeActive = currentPath === '/' || currentPath === ''

  return (
    <header className="navbar-header" ref={containerRef}>
      <div className="navbar-container">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>
          <img src="/heelpoint_logo.png" alt="HealPoint" className="brand-logo" />
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span className="hamburger" aria-hidden="true" />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary navigation">
          <a 
            href="/" 
            className={`nav-link ${isHomeActive ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/') }}
          >
            Home
          </a>
          <a 
            href="/services" 
            className={`nav-link ${currentPath === '/services' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/services') }}
          >
            Services
          </a>
          <a 
            href="/about" 
            className={`nav-link ${currentPath === '/about' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/about') }}
          >
            About
          </a>

          {user ? (
            <a 
              href={getDashboardPath()} 
              className="nav-user-pill"
              onClick={(e) => { e.preventDefault(); handleNavigate(getDashboardPath()) }}
            >
              <span className="user-dot" />
              <span>{user.first_name || 'Dashboard'}</span>
            </a>
          ) : (
            <div className="nav-auth-group">
              <a 
                href="/login" 
                className={`nav-link nav-link-login ${currentPath === '/login' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); handleNavigate('/login') }}
              >
                Log in
              </a>
            </div>
          )}

          {!isDoctor && !isAdmin && (
            <a className="nav-cta mobile-cta" href="/doctors" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors') }}>
              Book Appointment
            </a>
          )}
        </nav>

        {!isDoctor && !isAdmin && (
          <a className="nav-cta desktop-cta" href="/doctors" onClick={(e) => { e.preventDefault(); handleNavigate('/doctors') }}>
            Book Appointment
          </a>
        )}
      </div>
    </header>
  )
}

export default Navbar
