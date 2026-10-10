import React, { useState } from 'react'

const DoctorProfileTab = ({
  profileData = {},
  onSaveProfile
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [certificateFile, setCertificateFile] = useState(null)

  const handleEditClick = () => {
    setProfileForm({
      experience: profileData.experience !== 'N/A' ? profileData.experience : '',
      education: profileData.education !== 'N/A' ? profileData.education : '',
      location: profileData.clinic !== 'N/A' ? profileData.clinic : '',
      phone_number: profileData.phone !== 'N/A' ? profileData.phone : '',
      bio: profileData.bio !== 'No bio provided.' ? profileData.bio : ''
    })
    setIsEditingProfile(true)
  }

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    await onSaveProfile(profileForm, profilePictureFile, certificateFile)
    setIsEditingProfile(false)
  }

  if (isEditingProfile) {
    return (
      <section className="dashboard-section">
        <h2>Edit Profile</h2>
        <form className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
          <label>
            Profile Picture
            <input type="file" accept="image/*" onChange={(e) => setProfilePictureFile(e.target.files[0])} />
          </label>
          <label>
            MBBS Certificate
            <input type="file" accept="image/*,.pdf" onChange={(e) => setCertificateFile(e.target.files[0])} />
          </label>
          <label>
            Experience
            <input type="text" name="experience" value={profileForm.experience || ''} onChange={handleProfileChange} />
          </label>
          <label>
            Education
            <input type="text" name="education" value={profileForm.education || ''} onChange={handleProfileChange} />
          </label>
          <label>
            Clinic / Location
            <input type="text" name="location" value={profileForm.location || ''} onChange={handleProfileChange} />
          </label>
          <label>
            Phone Number
            <input type="text" name="phone_number" value={profileForm.phone_number || ''} onChange={handleProfileChange} />
          </label>
          <label>
            Bio
            <textarea name="bio" value={profileForm.bio || ''} onChange={handleProfileChange} rows="4"></textarea>
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="primary-btn" onClick={handleSave}>Save Changes</button>
            <button type="button" className="secondary-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
          </div>
        </form>
      </section>
    )
  }

  return (
    <section className="dashboard-section">
      <h2>Your Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <h3>{profileData.name}</h3>
          <p className="profile-specialization">{profileData.specialization}</p>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <label>Experience</label>
            <p>{profileData.experience}</p>
          </div>
          <div className="profile-item">
            <label>Education</label>
            <p>{profileData.education}</p>
          </div>
          <div className="profile-item">
            <label>Clinic / Location</label>
            <p>{profileData.clinic}</p>
          </div>
          <div className="profile-item">
            <label>Phone</label>
            <p>{profileData.phone}</p>
          </div>
          <div className="profile-item">
            <label>Email</label>
            <p>{profileData.email}</p>
          </div>
          <div className="profile-item">
            <label>Bio</label>
            <p>{profileData.bio}</p>
          </div>
          <div className="profile-item full-width" style={{ gridColumn: '1 / -1' }}>
            <label>MBBS Certificate</label>
            {profileData.certificate ? (
              <a href={profileData.certificate} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                View Uploaded Certificate
              </a>
            ) : (
              <p style={{ color: '#94a3b8' }}>No certificate uploaded</p>
            )}
          </div>
        </div>

        <button type="button" className="primary-btn edit-profile-btn" onClick={handleEditClick}>Edit Profile</button>
      </div>
    </section>
  )
}

export default DoctorProfileTab
