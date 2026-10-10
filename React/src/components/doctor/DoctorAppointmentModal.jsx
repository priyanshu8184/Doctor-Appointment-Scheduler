import React, { useState } from 'react';
import { X, XCircle, AlertTriangle, FileText, Calendar, Clock, User, Phone, Mail, MapPin, Video } from 'lucide-react';

export const DoctorRejectModal = ({
  appointment,
  onClose,
  onConfirmReject
}) => {
  const [reason, setReason] = useState('');

  if (!appointment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmReject(appointment.id, reason);
    setReason('');
  };

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-card" onClick={e => e.stopPropagation()}>
        <div className="doc-modal-header" style={{ background: '#7F1D1D', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Decline Appointment Request</h3>
          </div>
          <button type="button" className="doc-modal-close" onClick={onClose} style={{ color: '#fff' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="doc-modal-body">
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
              <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#991B1B', fontSize: '0.875rem' }}>
                  Decline consultation for {appointment.patientName}
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: '#B91C1C' }}>
                  The patient will be notified with your explanation. A refund will be initiated if pre-paid.
                </p>
              </div>
            </div>

            <div className="doc-form-group">
              <label className="doc-form-label">Reason for declining *</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Schedule emergency surgery conflict, please rebook for tomorrow after 2 PM..."
                required
                rows="3"
                className="doc-form-input"
              />
            </div>
          </div>

          <div className="doc-modal-footer">
            <button type="button" className="doc-btn secondary" onClick={onClose}>
              Keep Appointment
            </button>
            <button type="submit" className="doc-btn danger">
              Confirm Decline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DoctorAppointmentDetailsModal = ({
  appointment,
  onClose,
  onJoinConsultation
}) => {
  if (!appointment) return null;

  const aptDate = new Date(appointment.date);
  const formattedDate = !isNaN(aptDate) ? aptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-card" onClick={e => e.stopPropagation()}>
        <div className="doc-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#087F72" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#172033' }}>
              Appointment Details #{appointment.id}
            </h3>
          </div>
          <button type="button" className="doc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="doc-modal-body">
          <div className="doc-detail-grid">
            <div className="doc-detail-field">
              <span className="doc-detail-label">Patient Name</span>
              <span className="doc-detail-value">{appointment.patientName}</span>
            </div>
            <div className="doc-detail-field">
              <span className="doc-detail-label">Patient Email / Phone</span>
              <span className="doc-detail-value">{appointment.patientEmail || appointment.phone || 'patient@healpoint.com'}</span>
            </div>
            <div className="doc-detail-field">
              <span className="doc-detail-label">Scheduled Date</span>
              <span className="doc-detail-value">{formattedDate}</span>
            </div>
            <div className="doc-detail-field">
              <span className="doc-detail-label">Time Slot</span>
              <span className="doc-detail-value">{appointment.time}</span>
            </div>
            <div className="doc-detail-field">
              <span className="doc-detail-label">Consultation Mode</span>
              <span className="doc-detail-value">
                {appointment.type === 'VIDEO' ? '📹 Telemedicine Video Consultation' : '🏥 In-Person Clinic Visit'}
              </span>
            </div>
            <div className="doc-detail-field">
              <span className="doc-detail-label">Current Status</span>
              <span className={`appointment-status-badge ${appointment.status.toLowerCase()}`}>
                {appointment.status}
              </span>
            </div>
            {appointment.cancellation_reason && (
              <div className="doc-detail-field full" style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px' }}>
                <span className="doc-detail-label" style={{ color: '#B91C1C' }}>Reason Log</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#991B1B' }}>
                  {appointment.cancellation_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="doc-modal-footer">
          <button type="button" className="doc-btn secondary" onClick={onClose}>
            Close
          </button>
          {appointment.type === 'VIDEO' && (appointment.status === 'ACCEPTED' || appointment.status === 'SCHEDULED') && (
            <button 
              type="button" 
              className="doc-btn primary"
              onClick={() => {
                onClose();
                if (onJoinConsultation) onJoinConsultation(appointment);
              }}
            >
              <Video size={16} />
              <span>Join Video Room</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
