import React from 'react';
import { X, Edit3, AlertTriangle } from 'lucide-react';

const AdminRescheduleModal = ({
  rescheduleApt,
  onClose,
  newDatetime,
  setNewDatetime,
  rescheduleReason,
  setRescheduleReason,
  conflictError,
  onConfirmReschedule
}) => {
  if (!rescheduleApt) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Reschedule Appointment #{rescheduleApt.appointment_id}</h3>
          <button 
            type="button" 
            className="admin-modal-close" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirmReschedule}>
          <div className="admin-modal-body">
            <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.875rem' }}>
              Select a new slot for <strong>{rescheduleApt.patient_name}</strong> with <strong>{rescheduleApt.doctor_name}</strong>.
            </p>

            {conflictError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span>{conflictError}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-form-label">New Date & Time *</label>
              <input
                type="datetime-local"
                value={newDatetime}
                onChange={(e) => setNewDatetime(e.target.value)}
                required
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group" style={{ marginTop: '1rem' }}>
              <label className="admin-form-label">Rescheduling Reason / Clinical Note</label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g., Doctor emergency surgery conflict, Patient requested afternoon slot..."
                rows="3"
                className="admin-form-input"
              />
            </div>
          </div>

          <div className="admin-modal-actions">
            <button 
              type="button" 
              className="admin-btn secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn primary"
            >
              <Edit3 size={14} />
              <span>Confirm Reschedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRescheduleModal;
