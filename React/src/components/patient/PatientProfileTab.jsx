import React, { useState } from 'react'
import { User, Edit3 } from 'lucide-react'

const PatientProfileTab = ({
  profileData = {},
  onSaveProfile
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState(profileData)
  const [profilePictureFile, setProfilePictureFile] = useState(null)

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    await onSaveProfile(profileForm, profilePictureFile)
    setIsEditingProfile(false)
  }

  return (
    <section className="dashboard-section">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-title-group">
            <User size={20} className="section-icon" />
            <h3>{isEditingProfile ? 'Edit Profile Details' : profileData.name}</h3>
          </div>
          {!isEditingProfile ? (
            <button 
              type="button" 
              className="primary-btn edit-profile-btn" 
              onClick={() => { setIsEditingProfile(true); setProfileForm({ ...profileData }); }}
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="profile-header-actions">
              <button type="button" className="secondary-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              <button type="button" className="primary-btn" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <div className="profile-grid">
            <div className="profile-item full-width">
              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setProfilePictureFile(e.target.files[0])} />
            </div>
            <div className="profile-item">
              <label>First Name</label>
              <input type="text" name="firstName" value={profileForm.firstName || ''} onChange={handleProfileChange} />
            </div>
            <div className="profile-item">
              <label>Last Name</label>
              <input type="text" name="lastName" value={profileForm.lastName || ''} onChange={handleProfileChange} />
            </div>
            <div className="profile-item">
              <label>Phone Number</label>
              <input type="text" name="phone" value={profileForm.phone || ''} onChange={handleProfileChange} />
            </div>
            <div className="profile-item">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth || ''} onChange={handleProfileChange} />
            </div>
            <div className="profile-item">
              <label>Gender</label>
              <select name="gender" value={profileForm.gender || ''} onChange={handleProfileChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="profile-item">
              <label>Blood Group</label>
              <input type="text" name="bloodGroup" value={profileForm.bloodGroup || ''} onChange={handleProfileChange} />
            </div>
            <div className="profile-item">
              <label>Address</label>
              <input type="text" name="address" value={profileForm.address || ''} onChange={handleProfileChange} />
            </div>
            <div className="profile-item">
              <label>Emergency Contact</label>
              <input type="text" name="emergencyContact" value={profileForm.emergencyContact || ''} onChange={handleProfileChange} />
            </div>
          </div>
        ) : (
          <div className="profile-grid">
            <div className="profile-item">
              <label>Email Address</label>
              <p>{profileData.email}</p>
            </div>
            <div className="profile-item">
              <label>Phone Number</label>
              <p>{profileData.phone}</p>
            </div>
            <div className="profile-item">
              <label>Date of Birth</label>
              <p>{profileData.dateOfBirth}</p>
            </div>
            <div className="profile-item">
              <label>Gender</label>
              <p>{profileData.gender}</p>
            </div>
            <div className="profile-item">
              <label>Blood Group</label>
              <p>{profileData.bloodGroup}</p>
            </div>
            <div className="profile-item">
              <label>Home Address</label>
              <p>{profileData.address}</p>
            </div>
            <div className="profile-item full-width">
              <label>Emergency Contact</label>
              <p>{profileData.emergencyContact}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PatientProfileTab
