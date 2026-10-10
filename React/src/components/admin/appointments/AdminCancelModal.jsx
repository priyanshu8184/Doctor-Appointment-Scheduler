import React from 'react';
import { X, XCircle, AlertTriangle } from 'lucide-react';

const AdminCancelModal = ({
  cancelApt,
  onClose,
  cancellationReason,
  setCancellationReason,
  onConfirmCancel
}) => {
  if (!cancelApt) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Cancel Appointment #{cancelApt.appointment_id}</h3>
          <button 
            type="button" 
            className="admin-modal-close" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirmCancel}>
          <div className="admin-modal-body">
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px 14px', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', gap: '10px' }}>
              <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#991B1B', fontSize: '0.875rem' }}>
                  Are you sure you want to cancel this booking?
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: '#B91C1C' }}>
                  Cancelling will release the slot and mark payment for refund if applicable.
                </p>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Reason for Cancellation *</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="State the clinical or administrative reason for cancelling this appointment..."
                required
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
              Keep Booking
            </button>
            <button 
              type="submit" 
              className="admin-btn danger"
            >
              <XCircle size={14} />
              <span>Cancel Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCancelModal;
