import React from 'react';
import { X } from 'lucide-react';

const DoctorRejectModal = ({
  doctor,
  onClose,
  rejectionReason,
  setRejectionReason,
  onConfirmReject
}) => {
  if (!doctor) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header" style={{ background: '#7F1D1D' }}>
          <h3>Reject Doctor Registration Application</h3>
          <button 
            type="button" 
            className="admin-modal-close" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirmReject}>
          <div className="admin-modal-body">
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
              You are rejecting the registration for <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>. Please provide a clear audit rationale for clinical record integrity:
            </p>

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#172033' }}>
              Rejection Rationale / Missing Verification Items
            </label>
            <textarea
              className="admin-textarea"
              rows="3"
              placeholder="e.g. License number could not be verified in state medical council database..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn danger"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRejectModal;
