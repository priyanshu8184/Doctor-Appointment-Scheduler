import React from 'react';
import { X } from 'lucide-react';

const DoctorSuspendModal = ({
  doctor,
  onClose,
  suspensionReason,
  setSuspensionReason,
  onConfirmSuspend
}) => {
  if (!doctor) return null;

  const isSuspended = doctor.approval_status === 'SUSPENDED';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header" style={{ background: isSuspended ? '#065F46' : '#7F1D1D' }}>
          <h3>
            {isSuspended 
              ? 'Reactivate Doctor Account' 
              : 'Suspend Doctor Account'}
          </h3>
          <button 
            type="button" 
            className="admin-modal-close" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirmSuspend}>
          <div className="admin-modal-body">
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
              {isSuspended
                ? `Are you sure you want to reactivate Dr. ${doctor.first_name} ${doctor.last_name}? They will be able to accept new consultations immediately.`
                : `Suspending Dr. ${doctor.first_name} ${doctor.last_name} will temporarily prevent new appointments while preserving past records.`
              }
            </p>

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#172033' }}>
              Administrative Note (Optional)
            </label>
            <textarea
              className="admin-textarea"
              rows="2"
              placeholder="Reason for account status modification..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
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
              className={isSuspended ? 'admin-btn success' : 'admin-btn danger'}
            >
              Confirm {isSuspended ? 'Reactivation' : 'Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorSuspendModal;
