import React from 'react';
import { X } from 'lucide-react';

const DoctorDetailsModal = ({
  doctor,
  onClose,
  onApprove,
  onOpenReject
}) => {
  if (!doctor) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Doctor Professional Credentials & Details</h3>
          <button 
            type="button" 
            className="admin-modal-close" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-detail-grid">
            <div className="admin-detail-field">
              <span className="admin-detail-label">Practitioner Name</span>
              <span className="admin-detail-value">Dr. {doctor.first_name} {doctor.last_name}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Email Address</span>
              <span className="admin-detail-value">{doctor.email}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Primary Specialty</span>
              <span className="admin-detail-value">{doctor.specialization}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Medical License No.</span>
              <span className="admin-detail-value" style={{ fontFamily: 'monospace' }}>
                {doctor.medical_license_number || 'MED-LIC-PENDING'}
              </span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Qualifications</span>
              <span className="admin-detail-value">{doctor.qualifications || 'MBBS, MD'}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Clinical Experience</span>
              <span className="admin-detail-value">{doctor.experience_years || 8} Years</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Consultation Fee</span>
              <span className="admin-detail-value">${doctor.consultation_fee}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Practice Location</span>
              <span className="admin-detail-value">{doctor.location}</span>
            </div>
            <div className="admin-detail-field full">
              <span className="admin-detail-label">Professional Biography</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {doctor.bio}
              </p>
            </div>
            {doctor.rejection_reason && (
              <div className="admin-detail-field full" style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px' }}>
                <span className="admin-detail-label" style={{ color: '#B91C1C' }}>Rejection Reason Log</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#991B1B' }}>
                  {doctor.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn secondary"
            onClick={onClose}
          >
            Close
          </button>
          {doctor.approval_status === 'PENDING' && (
            <>
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => onOpenReject(doctor)}
              >
                Reject Application
              </button>
              <button
                type="button"
                className="admin-btn success"
                onClick={() => onApprove(doctor.doctor_id)}
              >
                Approve Practitioner
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsModal;
