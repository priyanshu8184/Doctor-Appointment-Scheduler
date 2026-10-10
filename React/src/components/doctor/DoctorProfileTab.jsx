import React, { useState, useEffect } from 'react';
import {
  User,
  Award,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  FileCheck,
  Edit3,
  Check,
  X,
  Upload,
  ShieldCheck
} from 'lucide-react';

const DoctorProfileTab = ({
  profileData = {},
  onSaveProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    experience: '',
    education: '',
    location: '',
    phone_number: '',
    bio: '',
    consultation_fee: 65
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (profileData) {
      setFormData({
        first_name: profileData.first_name || (profileData.name ? profileData.name.replace(/^Dr\.?\s*/i, '').split(' ')[0] : ''),
        last_name: profileData.last_name || (profileData.name ? profileData.name.replace(/^Dr\.?\s*/i, '').split(' ').slice(1).join(' ') : ''),
        specialization: profileData.specialization || '',
        experience: profileData.experience || '',
        education: profileData.education || '',
        location: profileData.clinic || '',
        phone_number: profileData.phone || '',
        bio: profileData.bio || '',
        consultation_fee: profileData.consultation_fee || 65
      });
      setPreviewUrl(profileData.profilePicture || null);
    }
  }, [profileData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificateFile(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile(formData, profilePictureFile, certificateFile);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    const clean = name.replace(/^Dr\.?\s*/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="doctor-tab-container">
      <div className="doc-content-card">
        {/* Profile Banner */}
        <div className="doc-profile-hero">
          <div className="doc-profile-avatar-wrap">
            {previewUrl ? (
              <img src={previewUrl} alt={profileData.name} className="doc-profile-hero-img" />
            ) : (
              <div className="doc-profile-initials-badge">
                {getInitials(profileData.name)}
              </div>
            )}
          </div>

          <div className="doc-profile-hero-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 className="doc-profile-name">{profileData.name || 'Dr. Medical Specialist'}</h2>
              <span className="doc-verified-tag">
                <ShieldCheck size={14} />
                Verified Practitioner
              </span>
            </div>
            <p className="doc-profile-spec">{profileData.specialization || 'General Clinical Medicine'}</p>
            <p className="doc-profile-loc">
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {profileData.clinic || 'HealPoint Health Clinic'}
            </p>
          </div>

          <div className="doc-profile-hero-action">
            {!isEditing ? (
              <button
                type="button"
                className="doc-btn primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                className="doc-btn secondary"
                onClick={() => setIsEditing(false)}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content (View Mode vs Edit Form) */}
        {!isEditing ? (
          <div className="doc-profile-body">
            <div className="doc-profile-details-grid">
              <div className="doc-profile-info-block">
                <span className="info-block-label">
                  <Award size={16} color="#087F72" />
                  Experience & Clinical Practice
                </span>
                <p className="info-block-val">{profileData.experience || '10+ years'}</p>
              </div>

              <div className="doc-profile-info-block">
                <span className="info-block-label">
                  <BookOpen size={16} color="#087F72" />
                  Education & Qualifications
                </span>
                <p className="info-block-val">{profileData.education || 'MBBS, MD'}</p>
              </div>

              <div className="doc-profile-info-block">
                <span className="info-block-label">
                  <DollarSign size={16} color="#087F72" />
                  Consultation Fee
                </span>
                <p className="info-block-val">${profileData.consultation_fee || 65} / Session</p>
              </div>

              <div className="doc-profile-info-block">
                <span className="info-block-label">
                  <Phone size={16} color="#087F72" />
                  Contact Telephone
                </span>
                <p className="info-block-val">{profileData.phone || '+1 (555) 019-3482'}</p>
              </div>

              <div className="doc-profile-info-block">
                <span className="info-block-label">
                  <Mail size={16} color="#087F72" />
                  Professional Email
                </span>
                <p className="info-block-val">{profileData.email || 'doctor@healpoint.com'}</p>
              </div>

              <div className="doc-profile-info-block">
                <span className="info-block-label">
                  <FileCheck size={16} color="#087F72" />
                  Medical License & Certificate
                </span>
                {profileData.certificate ? (
                  <a
                    href={profileData.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-cert-link"
                  >
                    View Uploaded Accreditation Document
                  </a>
                ) : (
                  <p className="info-block-val" style={{ color: '#94A3B8' }}>Verified on file</p>
                )}
              </div>
            </div>

            <div className="doc-profile-bio-box">
              <span className="info-block-label">Biography & Clinical Focus</span>
              <p className="bio-text">{profileData.bio || 'Board-certified medical specialist dedicated to patient wellness.'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="doc-profile-edit-form">
            <h3 style={{ margin: '0 0 1.25rem 0', color: '#172033', fontSize: '1.1rem' }}>
              Update Practitioner Credentials
            </h3>

            <div className="doc-form-row">
              <div className="doc-form-group">
                <label className="doc-form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="doc-form-input"
                />
              </div>

              <div className="doc-form-group">
                <label className="doc-form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="doc-form-input"
                />
              </div>

              <div className="doc-form-group">
                <label className="doc-form-label">Specialization / Specialty</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Dermatology, Cardiology"
                  className="doc-form-input"
                />
              </div>
            </div>

            <div className="doc-form-row">
              <div className="doc-form-group">
                <label className="doc-form-label">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 12 years"
                  className="doc-form-input"
                />
              </div>

              <div className="doc-form-group">
                <label className="doc-form-label">Qualifications / Degrees</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD, FRCS"
                  className="doc-form-input"
                />
              </div>

              <div className="doc-form-group">
                <label className="doc-form-label">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  min="0"
                  className="doc-form-input"
                />
              </div>
            </div>

            <div className="doc-form-row">
              <div className="doc-form-group">
                <label className="doc-form-label">Clinic / Hospital Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. HealPoint Health Center, Suite 402"
                  className="doc-form-input"
                />
              </div>

              <div className="doc-form-group">
                <label className="doc-form-label">Contact Phone</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="doc-form-input"
                />
              </div>
            </div>

            <div className="doc-form-row">
              <div className="doc-form-group">
                <label className="doc-form-label">Profile Photo (Upload new)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="doc-form-input file"
                />
              </div>

              <div className="doc-form-group">
                <label className="doc-form-label">Medical Certificate / License Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCertificateChange}
                  className="doc-form-input file"
                />
              </div>
            </div>

            <div className="doc-form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="doc-form-label">Professional Biography</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Share your clinical philosophy, clinical interests, and training..."
                className="doc-form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="doc-btn secondary"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="doc-btn primary"
                disabled={saving}
              >
                <Check size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileTab;
