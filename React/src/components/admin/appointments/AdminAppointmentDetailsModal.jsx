import React from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';

const AdminAppointmentDetailsModal = ({
  viewApt,
  onClose,
  onSingleExportPdf,
  onSingleExportImage
}) => {
  if (!viewApt) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Appointment Details #{viewApt.appointment_id}</h3>
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
              <span className="admin-detail-label">Patient Name</span>
              <span className="admin-detail-value">{viewApt.patient_name}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Patient Email</span>
              <span className="admin-detail-value">{viewApt.patient_email}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Doctor Name</span>
              <span className="admin-detail-value">{viewApt.doctor_name}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Specialty</span>
              <span className="admin-detail-value">{viewApt.specialization}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Scheduled Time</span>
              <span className="admin-detail-value">{new Date(viewApt.appointment_datetime).toLocaleString()}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Consultation Mode</span>
              <span className="admin-detail-value">{viewApt.appointment_type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Clinic'}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Status</span>
              <span className="admin-detail-value">{viewApt.status}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-label">Payment Status</span>
              <span className="admin-detail-value">${viewApt.payment_amount || '65.00'} ({viewApt.payment_status || 'COMPLETED'})</span>
            </div>
            {viewApt.cancellation_reason && (
              <div className="admin-detail-field full" style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px' }}>
                <span className="admin-detail-label" style={{ color: '#B91C1C' }}>Cancellation Rationale</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#991B1B' }}>
                  {viewApt.cancellation_reason}
                </p>
              </div>
            )}
          </div>

          {/* Individual Export Hub inside Modal */}
          <div style={{ marginTop: '1rem', padding: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#087F72', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Download Individual Booking Slip
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="admin-btn secondary sm"
                onClick={() => onSingleExportPdf(viewApt)}
              >
                <FileText size={13} color="#DC2626" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                type="button"
                className="admin-btn secondary sm"
                onClick={() => onSingleExportImage(viewApt, 'png')}
              >
                <ImageIcon size={13} color="#2563EB" />
                <span>Download PNG Card</span>
              </button>

              <button
                type="button"
                className="admin-btn secondary sm"
                onClick={() => onSingleExportImage(viewApt, 'jpg')}
              >
                <ImageIcon size={13} color="#059669" />
                <span>Download JPG Card</span>
              </button>
            </div>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button 
            type="button" 
            className="admin-btn secondary" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentDetailsModal;
