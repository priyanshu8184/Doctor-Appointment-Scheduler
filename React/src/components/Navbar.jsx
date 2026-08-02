import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'

const Navbar = () => {
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

  return (
    <header className="navbar" ref={containerRef}>
      <a className="brand" href="#home" onClick={() => setOpen(false)}>
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
        <a href="#services" onClick={() => setOpen(false)}>
          Services
        </a>
        <a href="#about" onClick={() => setOpen(false)}>
          About
        </a>
        <a href="#contact" onClick={() => setOpen(false)}>
          Contact
        </a>
        <a className="nav-cta mobile-cta" href="#appointment" onClick={() => setOpen(false)}>
          Book Now
        </a>
      </nav>

      <a className="nav-cta desktop-cta" href="#appointment" onClick={() => setOpen(false)}>
        Book Now
      </a>
    </header>
  )
}

export default Navbar
