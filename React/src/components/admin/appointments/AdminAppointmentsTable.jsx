import React from 'react';
import {
  Calendar,
  Eye,
  FileText,
  Edit3,
  XCircle,
  Loader2
} from 'lucide-react';

const AdminAppointmentsTable = ({
  appointments = [],
  loading = false,
  onViewApt,
  onSingleExportPdf,
  onOpenReschedule,
  onOpenCancel
}) => {
  return (
    <div className="admin-table-container">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Schedule</th>
              <th>Type</th>
              <th>Status</th>
              <th>Fee / Payment</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <Loader2 size={28} className="admin-spinner" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '0.5rem', color: '#64748B' }}>Loading platform bookings...</p>
                </td>
              </tr>
            ) : appointments.length > 0 ? (
              appointments.map(apt => (
                <tr key={apt.appointment_id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#087F72' }}>#{apt.appointment_id}</span>
                  </td>
                  <td>
                    <div>
                      <strong style={{ display: 'block', color: '#172033' }}>{apt.patient_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{apt.patient_email}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong style={{ display: 'block', color: '#172033' }}>{apt.doctor_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#087F72', fontWeight: 600 }}>{apt.specialization}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div>{new Date(apt.appointment_datetime).toLocaleDateString()}</div>
                      <div style={{ color: '#64748B' }}>{new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge" style={{ background: apt.appointment_type === 'VIDEO' ? '#EFF6FF' : '#F1F5F9', color: apt.appointment_type === 'VIDEO' ? '#2563EB' : '#475569' }}>
                      {apt.appointment_type === 'VIDEO' ? 'Telemedicine' : 'In-Person'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${apt.payment_status?.toLowerCase() || 'completed'}`}>
                      ${apt.payment_amount || '65.00'} • {apt.payment_status || 'PAID'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        type="button"
                        className="admin-btn secondary sm"
                        onClick={() => onViewApt(apt)}
                        title="View Details & Download Options"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      {/* Direct PDF Download button for this booking */}
                      <button
                        type="button"
                        className="admin-btn secondary sm"
                        onClick={() => onSingleExportPdf(apt)}
                        title="Download Official Appointment Slip (PDF)"
                      >
                        <FileText size={13} color="#DC2626" />
                        <span>PDF</span>
                      </button>

                      {apt.status === 'SCHEDULED' && (
                        <>
                          <button
                            type="button"
                            className="admin-btn primary sm"
                            onClick={() => onOpenReschedule(apt)}
                            title="Reschedule Appointment"
                          >
                            <Edit3 size={13} />
                            <span>Reschedule</span>
                          </button>
                          <button
                            type="button"
                            className="admin-btn danger sm"
                            onClick={() => onOpenCancel(apt)}
                            title="Cancel Appointment"
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  <Calendar size={32} style={{ margin: '0 auto 0.5rem auto', color: '#94A3B8', display: 'block' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No appointments matched your query.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAppointmentsTable;
