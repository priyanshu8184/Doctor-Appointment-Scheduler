import React from 'react';
import {
  User as UserIcon,
  LayoutDashboard,
  Calendar,
  Clock,
  LogOut,
  ShieldCheck,
  Users,
  FileCheck
} from 'lucide-react';

const UserProfileDropdown = ({
  user,
  dropdownOpen,
  setDropdownOpen,
  profileMenuRef,
  imgError,
  setImgError,
  isDoctor,
  isAdmin,
  isPatient,
  getDisplayName,
  getInitials,
  profilePictureUrl,
  handleNavigate,
  handleLogout
}) => {
  if (!user) return null;

  return (
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

      {/* Account Dropdown Card */}
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
              <p className="dropdown-user-email">{user.email || 'doctor@healpoint.com'}</p>
              <div className="dropdown-role-badge">
                <span className="role-dot" />
                <span>
                  {isAdmin 
                    ? 'Administrator' 
                    : (isDoctor ? 'Doctor Account' : 'Patient Account')}
                </span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Dropdown Navigation Links — Dynamic per Role */}
          <div className="dropdown-menu-list">
            {/* A. DOCTOR MENU */}
            {isDoctor && (
              <>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/doctor-dashboard')}
                >
                  <LayoutDashboard size={16} className="item-icon" aria-hidden="true" />
                  <span>My Doctor Dashboard</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/doctor-dashboard?tab=today')}
                >
                  <Calendar size={16} className="item-icon" aria-hidden="true" />
                  <span>My Appointments</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/doctor-dashboard?tab=availability')}
                >
                  <Clock size={16} className="item-icon" aria-hidden="true" />
                  <span>My Availability</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/doctor-dashboard?tab=profile')}
                >
                  <UserIcon size={16} className="item-icon" aria-hidden="true" />
                  <span>My Profile</span>
                </button>
              </>
            )}

            {/* B. ADMIN MENU */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/admin/dashboard')}
                >
                  <LayoutDashboard size={16} className="item-icon" aria-hidden="true" />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/admin/doctors')}
                >
                  <FileCheck size={16} className="item-icon" aria-hidden="true" />
                  <span>Doctor Approvals</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/admin/patients')}
                >
                  <Users size={16} className="item-icon" aria-hidden="true" />
                  <span>Patients Management</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/admin/appointments')}
                >
                  <Calendar size={16} className="item-icon" aria-hidden="true" />
                  <span>Appointments System</span>
                </button>
              </>
            )}

            {/* C. PATIENT MENU */}
            {isPatient && (
              <>
                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/patient-dashboard')}
                >
                  <LayoutDashboard size={16} className="item-icon" aria-hidden="true" />
                  <span>Patient Dashboard</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/patient-dashboard?tab=upcoming')}
                >
                  <Calendar size={16} className="item-icon" aria-hidden="true" />
                  <span>My Appointments</span>
                </button>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  role="menuitem"
                  onClick={() => handleNavigate('/patient-dashboard?tab=profile')}
                >
                  <UserIcon size={16} className="item-icon" aria-hidden="true" />
                  <span>Health Profile</span>
                </button>
              </>
            )}
          </div>

          <div className="dropdown-divider" />

          {/* Logout Action */}
          <div className="dropdown-footer">
            <button
              type="button"
              className="dropdown-logout-btn"
              role="menuitem"
              onClick={handleLogout}
            >
              <LogOut size={16} className="item-icon" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
