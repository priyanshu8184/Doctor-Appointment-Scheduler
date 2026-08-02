import React from 'react'

const Navbar = () => {
  return (
    <header className="navbar">
      <a className="brand" href="#home">
        <img src="/heelpoint_logo.png" alt="HealPoint logo" className="brand-logo" />
        <span>HealPoint</span>
      </a>

      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>

      <a className="nav-cta" href="#appointment">
        Book Now
      </a>
    </header>
  )
}

export default Navbar
