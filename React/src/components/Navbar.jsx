import React, { useState, useEffect, useRef } from 'react'
import { 
  User as UserIcon, 
  LayoutDashboard, 
  Calendar, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Stethoscope
} from 'lucide-react'
import './Navbar.css'

const Navbar = ({ onNavigate }) => {
  const [open, setOpen] = useState(false) // Mobile nav drawer
  const [dropdownOpen, setDropdownOpen] = useState(false) // Account profile menu
  const [imgError, setImgError] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (e) {
      return null
    }
  })

  const containerRef = useRef(null)
  const profileMenuRef = useRef(null)
  const currentPath = window.location.pathname

  // Sync user state with localStorage and auth events
  useEffect(() => {
    const syncUser = () => {
      try {
        const userStr = localStorage.getItem('user')
        setUser(userStr ? JSON.parse(userStr) : null)
        setImgError(false)
      } catch (e) {
        setUser(null)
      }
    }

    window.addEventListener('storage', syncUser)
    window.addEventListener('app-navigate', syncUser)
    window.addEventListener('user-auth-change', syncUser)
    window.addEventListener('popstate', syncUser)

    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('app-navigate', syncUser)
      window.removeEventListener('user-auth-change', syncUser)
      window.removeEventListener('popstate', syncUser)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const onOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (open && containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [open, dropdownOpen])

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleNavigate = (nextRoute) => {
    setOpen(false)
    setDropdownOpen(false)

    if (onNavigate) {
      onNavigate(nextRoute)
      return
    }

    window.history.pushState({}, '', nextRoute)
    window.dispatchEvent(new Event('app-navigate'))
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    setOpen(false)
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new Event('user-auth-change'))
    handleNavigate('/login')
  }

  const isDoctor = user?.role === 'DOCTOR'
  const isAdmin = user?.role === 'ADMIN'
  const isPatient = !isDoctor && !isAdmin

  // Routes mapping based on role
  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard'
    if (isDoctor) return '/doctor-dashboard'
    return '/patient-dashboard'
  }

  const getProfilePath = () => {
    if (isAdmin) return '/admin/dashboard'
    if (isDoctor) return '/doctor-dashboard?tab=profile'
    return '/patient-dashboard?tab=profile'
  }

  const getAppointmentsPath = () => {
    if (isAdmin) return '/admin/appointments'
    if (isDoctor) return '/doctor-dashboard?tab=today'
    return '/patient-dashboard?tab=upcoming'
  }

  // Fallback initials calculation
  const getInitials = () => {
    if (!user) return 'U'
    if (user.first_name || user.last_name) {
      const f = user.first_name ? user.first_name.trim()[0] : ''
      const l = user.last_name ? user.last_name.trim()[0] : ''
      return (f + l).toUpperCase() || 'U'
    }
    if (user.name) {
      const parts = user.name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return user.name.slice(0, 2).toUpperCase()
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase()
    return 'U'
  }

  const getDisplayName = () => {
    if (!user) return 'Account'
    if (user.first_name || user.last_name) {
      const prefix = isDoctor && !user.first_name?.toLowerCase().startsWith('dr') ? 'Dr. ' : ''
      return `${prefix}${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    return user.name || user.email?.split('@')[0] || 'User'
  }

  const getProfilePictureUrl = () => {
    if (!user) return null
    const pic = user.profile_picture || user.profilePicture
    if (!pic) return null
    if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:')) {
      return pic
    }
    const apiBase = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'
    return `${apiBase.replace('/api', '')}${pic}`
  }

  const profilePictureUrl = getProfilePictureUrl()
  const isHomeActive = currentPath === '/' || currentPath === ''

  return (
    <header className="navbar-header" ref={containerRef}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>
          <img src="/heelpoint_logo.png" alt="HealPoint" className="brand-logo" />
        </a>

        {/* Primary Navigation Links */}
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

          {/* Logged-Out: Login Link in Nav */}
          {!user && (
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

          {/* Mobile CTA */}
          {isPatient && (
            <a 
              className="nav-cta mobile-cta" 
              href="/doctors" 
              onClick={(e) => { e.preventDefault(); handleNavigate('/doctors') }}
            >
              Book Appointment
            </a>
          )}
        </nav>

        {/* Right Section: Desktop CTA & Gmail-style Account Profile Menu */}
        <div className="navbar-right-cluster">
          {/* Book Appointment CTA Button */}
          {isPatient && (
            <a 
              className="nav-cta desktop-cta" 
              href="/doctors" 
              onClick={(e) => { e.preventDefault(); handleNavigate('/doctors') }}
            >
              Book Appointment
            </a>
          )}

          {/* Logged-In User Profile Avatar & Dropdown */}
          {user && (
            <div className="nav-profile-menu-container" ref={profileMenuRef}>
              <button
                type="button"
                className={`nav-avatar-trigger ${dropdownOpen ? 'active' : ''}`}
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label={`Account menu for ${getDisplayName()}`}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {profilePictureUrl && !imgError ? (
                  <img
                    src={profilePictureUrl}
                    alt=""
                    className="nav-avatar-img"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="nav-avatar-fallback">
                    {getInitials()}
                  </div>
                )}
                <span className="nav-avatar-online-dot" />
              </button>

              {/* Gmail-Style Account Dropdown Card */}
              {dropdownOpen && (
                <div 
                  className="nav-profile-dropdown"
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="User account menu"
                >
                  {/* Dropdown User Header */}
                  <div className="dropdown-user-header">
                    <div className="dropdown-avatar-wrap">
                      {profilePictureUrl && !imgError ? (
                        <img
                          src={profilePictureUrl}
                          alt=""
                          className="dropdown-avatar-img"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="dropdown-avatar-fallback">
                          {getInitials()}
                        </div>
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <h4 className="dropdown-user-name">{getDisplayName()}</h4>
                      <p className="dropdown-user-email">{user.email || 'user@healpoint.com'}</p>
                      <div className="dropdown-role-badge">
                        <span className="role-dot" />
                        <span>{isAdmin ? 'Administrator' : isDoctor ? 'Doctor Account' : 'Patient Account'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  {/* Dropdown Navigation Links */}
                  <div className="dropdown-menu-list">
                    <button
                      type="button"
                      className="dropdown-menu-item"
                      role="menuitem"
                      onClick={() => handleNavigate(getProfilePath())}
                    >
                      <UserIcon size={16} className="item-icon" aria-hidden="true" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-menu-item"
                      role="menuitem"
                      onClick={() => handleNavigate(getDashboardPath())}
                    >
                      <LayoutDashboard size={16} className="item-icon" aria-hidden="true" />
                      <span>My Dashboard</span>
                    </button>

                    {!isAdmin && (
                      <button
                        type="button"
                        className="dropdown-menu-item"
                        role="menuitem"
                        onClick={() => handleNavigate(getAppointmentsPath())}
                      >
                        <Calendar size={16} className="item-icon" aria-hidden="true" />
                        <span>My Appointments</span>
                      </button>
                    )}
                  </div>

                  <div className="dropdown-divider" />

                  {/* Dropdown Logout */}
                  <div className="dropdown-footer">
                    <button
                      type="button"
                      className="dropdown-logout-btn"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="logout-icon" aria-hidden="true" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hamburger toggle button for mobile */}
          <button
            className="nav-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
          >
            <span className="hamburger" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
