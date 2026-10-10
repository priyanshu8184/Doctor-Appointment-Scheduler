import React from 'react';

const NavLinks = ({
  open,
  isDoctor,
  isAdmin,
  isPatient,
  isLoggedOut,
  currentPath,
  handleNavigate
}) => {
  const isHomeActive = currentPath === '/' || currentPath === '';

  return (
    <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary navigation">
      {/* 1. DOCTOR NAVIGATION */}
      {isDoctor && (
        <>
          <a 
            href="/doctor-dashboard" 
            className={`nav-link ${currentPath === '/doctor-dashboard' && !window.location.search ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/doctor-dashboard'); }}
          >
            Doctor Dashboard
          </a>
          <a 
            href="/doctor-dashboard?tab=today" 
            className={`nav-link ${window.location.search.includes('tab=today') || window.location.search.includes('tab=upcoming') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/doctor-dashboard?tab=today'); }}
          >
            My Appointments
          </a>
          <a 
            href="/doctor-dashboard?tab=availability" 
            className={`nav-link ${window.location.search.includes('tab=availability') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/doctor-dashboard?tab=availability'); }}
          >
            My Availability
          </a>
          <a 
            href="/doctor-dashboard?tab=profile" 
            className={`nav-link ${window.location.search.includes('tab=profile') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/doctor-dashboard?tab=profile'); }}
          >
            My Profile
          </a>
        </>
      )}

      {/* 2. ADMIN NAVIGATION */}
      {isAdmin && (
        <>
          <a 
            href="/admin/dashboard" 
            className={`nav-link ${currentPath.includes('/admin/dashboard') || currentPath === '/admin' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/admin/dashboard'); }}
          >
            Admin Dashboard
          </a>
          <a 
            href="/admin/doctors" 
            className={`nav-link ${currentPath.includes('/admin/doctors') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/admin/doctors'); }}
          >
            Doctor Approvals
          </a>
          <a 
            href="/admin/patients" 
            className={`nav-link ${currentPath.includes('/admin/patients') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/admin/patients'); }}
          >
            Patients
          </a>
          <a 
            href="/admin/appointments" 
            className={`nav-link ${currentPath.includes('/admin/appointments') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/admin/appointments'); }}
          >
            Appointments
          </a>
        </>
      )}

      {/* 3. PATIENT & LOGGED-OUT NAVIGATION */}
      {!isDoctor && !isAdmin && (
        <>
          <a 
            href="/" 
            className={`nav-link ${isHomeActive ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}
          >
            Home
          </a>
          <a 
            href="/services" 
            className={`nav-link ${currentPath === '/services' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/services'); }}
          >
            Services
          </a>
          <a 
            href="/about" 
            className={`nav-link ${currentPath === '/about' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavigate('/about'); }}
          >
            About
          </a>

          {isPatient && (
            <a 
              href="/patient-dashboard" 
              className={`nav-link ${currentPath === '/patient-dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigate('/patient-dashboard'); }}
            >
              My Dashboard
            </a>
          )}

          {isLoggedOut && (
            <div className="nav-auth-group">
              <a 
                href="/login" 
                className={`nav-link nav-link-login ${currentPath === '/login' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); handleNavigate('/login'); }}
              >
                Log in
              </a>
            </div>
          )}

          {/* Mobile CTA (Patients & Visitors only) */}
          <a 
            className="nav-cta mobile-cta" 
            href="/doctors" 
            onClick={(e) => { e.preventDefault(); handleNavigate('/doctors'); }}
          >
            Book Appointment
          </a>
        </>
      )}
    </nav>
  );
};

export default NavLinks;
