import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'

const Navbar = ({ onNavigate }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const onOutside = (e) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    // use pointerdown to avoid race with React click handlers
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
    window.location.reload()
  }

  return (
    <header className="navbar" ref={containerRef}>
      <a className="brand" href="/" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>
        <img src="/heelpoint_logo.png" alt="HealPoint logo" className="brand-logo" />
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(s => !s) } }}
      >
        <span className="hamburger" aria-hidden="true" />
      </button>

      <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary navigation">
        <a href="/services" onClick={(e) => { e.preventDefault(); handleNavigate('/services') }}>
          Services
        </a>
        <a href="/about" onClick={(e) => { e.preventDefault(); handleNavigate('/about') }}>
          About
        </a>
        <a href="#contact" onClick={() => setOpen(false)}>
          Contact
        </a>
        <a href="/login" onClick={(e) => { e.preventDefault(); handleNavigate('/login') }}>
          Login
        </a>
        <a href="/signup" onClick={(e) => { e.preventDefault(); handleNavigate('/signup') }}>
          Register
        </a>
        <a className="nav-cta mobile-cta" href="/signup" onClick={(e) => { e.preventDefault(); handleNavigate('/signup') }}>
          Book Now
        </a>
      </nav>

      <a className="nav-cta desktop-cta" href="/signup" onClick={(e) => { e.preventDefault(); handleNavigate('/signup') }}>
        Book Now
      </a>
    </header>
  )
}

export default Navbar
