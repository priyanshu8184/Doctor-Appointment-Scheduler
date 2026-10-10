import React, { useState, useEffect, useRef } from 'react';
import NavLinks from './navbar/NavLinks';
import UserProfileDropdown from './navbar/UserProfileDropdown';
import './Navbar.css';

const Navbar = ({ onNavigate }) => {
  const [open, setOpen] = useState(false); // Mobile nav drawer
  const [dropdownOpen, setDropdownOpen] = useState(false); // Account profile menu
  const [imgError, setImgError] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const containerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const currentPath = window.location.pathname;

  // Sync user state with localStorage and auth events
  useEffect(() => {
    const syncUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        setUser(userStr ? JSON.parse(userStr) : null);
        setImgError(false);
      } catch (e) {
        setUser(null);
      }
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('app-navigate', syncUser);
    window.addEventListener('user-auth-change', syncUser);
    window.addEventListener('popstate', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('app-navigate', syncUser);
      window.removeEventListener('user-auth-change', syncUser);
      window.removeEventListener('popstate', syncUser);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (open && containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [open, dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNavigate = (nextRoute) => {
    setOpen(false);
    setDropdownOpen(false);

    if (onNavigate) {
      onNavigate(nextRoute);
      return;
    }

    window.history.pushState({}, '', nextRoute);
    window.dispatchEvent(new Event('app-navigate'));
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    setOpen(false);
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    setUser(null);
    window.dispatchEvent(new Event('user-auth-change'));
    handleNavigate('/login');
  };

  const role = (user?.role || '').toUpperCase();
  const isDoctor = role === 'DOCTOR';
  const isAdmin = role === 'ADMIN';
  const isPatient = user && role === 'PATIENT';
  const isLoggedOut = !user;

  // Dynamic Display Name with Role prefix
  const getDisplayName = () => {
    if (!user) return 'Account';
    if (isAdmin) return 'System Administrator';
    if (user.first_name || user.last_name) {
      const prefix = isDoctor && !user.first_name?.toLowerCase().startsWith('dr') ? 'Dr. ' : '';
      return `${prefix}${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    if (user.name) {
      const prefix = isDoctor && !user.name?.toLowerCase().startsWith('dr') ? 'Dr. ' : '';
      return `${prefix}${user.name}`.trim();
    }
    return user.email?.split('@')[0] || (isDoctor ? 'Doctor' : 'User');
  };

  // Fallback initials calculation
  const getInitials = () => {
    if (!user) return 'U';
    if (isAdmin) return 'SA';
    if (user.first_name || user.last_name) {
      const f = user.first_name ? user.first_name.trim()[0] : '';
      const l = user.last_name ? user.last_name.trim()[0] : '';
      return (f + l).toUpperCase() || (isDoctor ? 'DR' : 'U');
    }
    if (user.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.slice(0, 2).toUpperCase();
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return isDoctor ? 'DR' : 'U';
  };

  const getProfilePictureUrl = () => {
    if (!user) return null;
    const pic = user.profile_picture || user.profilePicture;
    if (!pic) return null;
    if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:')) {
      return pic;
    }
    const apiBase = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';
    return `${apiBase.replace('/api', '')}${pic}`;
  };

  const profilePictureUrl = getProfilePictureUrl();

  return (
    <header className="navbar-header" ref={containerRef}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <a 
          className="brand" 
          href={isDoctor ? "/doctor-dashboard" : (isAdmin ? "/admin/dashboard" : "/")} 
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigate(isDoctor ? "/doctor-dashboard" : (isAdmin ? "/admin/dashboard" : "/")); 
          }}
        >
          <img src="/heelpoint_logo.png" alt="HealPoint" className="brand-logo" />
        </a>

        {/* Primary Navigation Links (Dynamic by Role) */}
        <NavLinks
          open={open}
          isDoctor={isDoctor}
          isAdmin={isAdmin}
          isPatient={isPatient}
          isLoggedOut={isLoggedOut}
          currentPath={currentPath}
          handleNavigate={handleNavigate}
        />

        {/* Right Section: Desktop CTA & Profile Menu */}
        <div className="navbar-right-cluster">
          {/* Book Appointment CTA Button (STRICTLY for Patients and Logged-Out Visitors) */}
          {!isDoctor && !isAdmin && (
            <a 
              className="nav-cta desktop-cta" 
              href="/doctors" 
              onClick={(e) => { e.preventDefault(); handleNavigate('/doctors'); }}
            >
              Book Appointment
            </a>
          )}

          {/* Logged-In User Profile Avatar & Dropdown */}
          <UserProfileDropdown
            user={user}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            profileMenuRef={profileMenuRef}
            imgError={imgError}
            setImgError={setImgError}
            isDoctor={isDoctor}
            isAdmin={isAdmin}
            isPatient={isPatient}
            getDisplayName={getDisplayName}
            getInitials={getInitials}
            profilePictureUrl={profilePictureUrl}
            handleNavigate={handleNavigate}
            handleLogout={handleLogout}
          />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={`nav-toggle ${open ? 'open' : ''}`}
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={open}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
