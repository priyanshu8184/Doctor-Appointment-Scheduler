import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Video,
  Building,
  Eye,
  Edit3,
  XCircle,
  X,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  Loader2
} from 'lucide-react';
import {
  exportAppointmentsToPdf,
  exportSingleAppointmentToPdf,
  exportAppointmentsToImage,
  exportSingleAppointmentToImage
} from '../../utils/appointmentExporter';
import './AdminPages.css';

const AdminAppointmentsPage = ({ 
  appointments = [], 
  onUpdateStatus, 
  onReschedule, 
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Export State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const exportMenuRef = useRef(null);

  // Modals state
  const [viewApt, setViewApt] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [newDatetime, setNewDatetime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelApt, setCancelApt] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [conflictError, setConflictError] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'ACCEPTED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'ALL' && apt.status !== statusFilter) {
      return false;
    }
    if (specialtyFilter !== 'ALL' && apt.specialization?.toLowerCase() !== specialtyFilter.toLowerCase()) {
      return false;
    }
    if (startDate) {
      if (new Date(apt.appointment_datetime) < new Date(startDate)) return false;
    }
    if (endDate) {
      if (new Date(apt.appointment_datetime) > new Date(endDate + 'T23:59:59')) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = String(apt.appointment_id).includes(q);
      const matchPatient = apt.patient_name?.toLowerCase().includes(q);
      const matchDoctor = apt.doctor_name?.toLowerCase().includes(q);
      const matchSpec = apt.specialization?.toLowerCase().includes(q);
      return matchId || matchPatient || matchDoctor || matchSpec;
    }
    return true;
  });

  const activeFiltersObj = {
    status: statusFilter,
    specialty: specialtyFilter,
    startDate,
    endDate,
    search: searchTerm
  };

  // Bulk Export Handlers
  const handleExportPdf = async () => {
    setExporting(true);
    setExportMessage('Generating printable vector PDF report...');
    setExportDropdownOpen(false);
    try {
      await exportAppointmentsToPdf(filteredAppointments, activeFiltersObj);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF export.');
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  const handleExportImage = async (format = 'png') => {
    setExporting(true);
    setExportMessage(`Rendering high-resolution ${format.toUpperCase()} report...`);
    setExportDropdownOpen(false);
    try {
      await exportAppointmentsToImage(filteredAppointments, activeFiltersObj, format);
    } catch (err) {
      console.error('Image export error:', err);
      alert(`Failed to export ${format.toUpperCase()} image.`);
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  const handleExportCsv = () => {
    setExportDropdownOpen(false);
    const headers = ['Appointment ID', 'Patient Name', 'Doctor Name', 'Specialty', 'Date & Time', 'Status', 'Type', 'Payment Status', 'Fee'];
    const rows = filteredAppointments.map(a => [
      a.appointment_id,
      `"${a.patient_name || 'Patient'}"`,
      `"${a.doctor_name || 'Doctor'}"`,
      `"${a.specialization || 'General Medicine'}"`,
      `"${a.appointment_datetime}"`,
      a.status,
      a.appointment_type,
      a.payment_status || 'PAID',
      `$${a.payment_amount || 65.00}`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healpoint_appointments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Single Appointment Handlers
  const handleSingleExportPdf = async (apt) => {
    setExporting(true);
    setExportMessage(`Generating appointment slip #${apt.appointment_id}...`);
    try {
      await exportSingleAppointmentToPdf(apt);
    } catch (err) {
      console.error('Single PDF error:', err);
      alert('Failed to download appointment slip PDF.');
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  const handleSingleExportImage = async (apt, format = 'png') => {
    setExporting(true);
    setExportMessage(`Rendering appointment summary image (${format.toUpperCase()})...`);
    try {
      await exportSingleAppointmentToImage(apt, format);
    } catch (err) {
      console.error('Single image error:', err);
      alert(`Failed to export appointment ${format.toUpperCase()} image.`);
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancelApt) return;
    onUpdateStatus(cancelApt.appointment_id, 'CANCELLED', cancellationReason);
    setCancelApt(null);
    setCancellationReason('');
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleApt || !newDatetime) return;

    // Client-side conflict pre-check
    const conflict = appointments.find(a => 
      a.appointment_id !== rescheduleApt.appointment_id &&
      a.doctor_id === rescheduleApt.doctor_id &&
      a.status !== 'CANCELLED' &&
      Math.abs(new Date(a.appointment_datetime) - new Date(newDatetime)) < 25 * 60 * 1000
    );

    if (conflict) {
      setConflictError(`Scheduling conflict: Dr. ${rescheduleApt.doctor_name} is already booked at that time.`);
      return;
    }

    onReschedule(rescheduleApt.appointment_id, newDatetime, rescheduleReason);
    setRescheduleApt(null);
    setNewDatetime('');
    setRescheduleReason('');
    setConflictError('');
  };

  return (
    <div className="admin-appointments-view">
      {/* Exporting Loading Overlay Banner */}
      {exporting && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#111C2F',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: '1px solid #087F72'
        }}>
          <Loader2 size={18} className="animate-spin" style={{ color: '#A7F3D0' }} />
          <span>{exportMessage || 'Preparing export document...'}</span>
        </div>
      )}

      {/* Top Filter & Export Action Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by ID, patient, doctor, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span>All ({appointments.length})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'SCHEDULED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('SCHEDULED')}
          >
            <span>Scheduled ({scheduledCount})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            <span>Completed ({completedCount})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CANCELLED')}
          >
            <span>Cancelled ({cancelledCount})</span>
          </button>
        </div>

        {/* Export / Download Menu Button */}
        <div style={{ position: 'relative' }} ref={exportMenuRef}>
          <button
            type="button"
            className="admin-btn primary"
            onClick={() => setExportDropdownOpen(prev => !prev)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Export / Download ({filteredAppointments.length})</span>
            <ChevronDown size={14} />
          </button>

          {exportDropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              width: '240px',
              zIndex: 100,
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Export Filtered Dataset ({filteredAppointments.length})
              </div>

              <button
                type="button"
                className="admin-btn secondary sm"
                style={{ justifyContent: 'flex-start', border: 'none', width: '100%', padding: '8px 10px' }}
                onClick={handleExportPdf}
              >
                <FileText size={15} color="#DC2626" />
                <span style={{ fontWeight: 600 }}>Download as PDF Report</span>
              </button>

              <button
                type="button"
                className="admin-btn secondary sm"
                style={{ justifyContent: 'flex-start', border: 'none', width: '100%', padding: '8px 10px' }}
                onClick={() => handleExportImage('png')}
              >
                <ImageIcon size={15} color="#2563EB" />
                <span style={{ fontWeight: 600 }}>Download as PNG Image</span>
              </button>

              <button
                type="button"
                className="admin-btn secondary sm"
                style={{ justifyContent: 'flex-start', border: 'none', width: '100%', padding: '8px 10px' }}
                onClick={() => handleExportImage('jpg')}
              >
                <ImageIcon size={15} color="#059669" />
                <span style={{ fontWeight: 600 }}>Download as JPG Image</span>
              </button>

              <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

              <button
                type="button"
                className="admin-btn secondary sm"
                style={{ justifyContent: 'flex-start', border: 'none', width: '100%', padding: '8px 10px' }}
                onClick={handleExportCsv}
              >
                <Download size={15} color="#087F72" />
                <span style={{ fontWeight: 600 }}>Export Raw Data (CSV)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <Calendar size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Centralized Appointment Monitoring & Export</h3>
              <p className="admin-card-subtitle">
                Displaying {filteredAppointments.length} appointment record{filteredAppointments.length === 1 ? '' : 's'} (Full dataset scope)
              </p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Patient</th>
                <th>Doctor & Specialty</th>
                <th>Scheduled Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Actions & Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
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
                          onClick={() => setViewApt(apt)}
                          title="View Details & Download Options"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {/* Direct PDF Download button for this booking */}
                        <button
                          type="button"
                          className="admin-btn secondary sm"
                          onClick={() => handleSingleExportPdf(apt)}
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
                              onClick={() => {
                                setRescheduleApt(apt);
                                setNewDatetime(apt.appointment_datetime ? apt.appointment_datetime.slice(0, 16) : '');
                                setRescheduleReason('');
                                setConflictError('');
                              }}
                              title="Reschedule Appointment"
                            >
                              <Edit3 size={13} />
                              <span>Reschedule</span>
                            </button>
                            <button
                              type="button"
                              className="admin-btn danger sm"
                              onClick={() => {
                                setCancelApt(apt);
                                setCancellationReason('');
                              }}
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

      {/* 1. Appointment Details & Export Modal */}
      {viewApt && (
        <div className="admin-modal-overlay" onClick={() => setViewApt(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Appointment Details #{viewApt.appointment_id}</h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setViewApt(null)}
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
                    onClick={() => handleSingleExportPdf(viewApt)}
                  >
                    <FileText size={13} color="#DC2626" />
                    <span>Download PDF Receipt</span>
                  </button>

                  <button
                    type="button"
                    className="admin-btn secondary sm"
                    onClick={() => handleSingleExportImage(viewApt, 'png')}
                  >
                    <ImageIcon size={13} color="#2563EB" />
                    <span>Download PNG Card</span>
                  </button>

                  <button
                    type="button"
                    className="admin-btn secondary sm"
                    onClick={() => handleSingleExportImage(viewApt, 'jpg')}
                  >
                    <ImageIcon size={13} color="#059669" />
                    <span>Download JPG Card</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setViewApt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reschedule Appointment Modal */}
      {rescheduleApt && (
        <div className="admin-modal-overlay" onClick={() => setRescheduleApt(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#087F72' }}>
              <h3>Reschedule Appointment #{rescheduleApt.appointment_id}</h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setRescheduleApt(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule}>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
                  Rescheduling consultation for <strong>{rescheduleApt.patient_name}</strong> with <strong>{rescheduleApt.doctor_name}</strong> ({rescheduleApt.specialization}).
                </p>

                {conflictError && (
                  <div style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    {conflictError}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#172033' }}>
                    Select New Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    className="admin-search-input"
                    value={newDatetime}
                    onChange={(e) => { setNewDatetime(e.target.value); setConflictError(''); }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#172033' }}>
                    Administrative Reason / Notes (Optional)
                  </label>
                  <textarea
                    className="admin-textarea"
                    rows="2"
                    placeholder="e.g. Requested by doctor due to emergency surgery..."
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setRescheduleApt(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn primary"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Administrative Cancel Modal */}
      {cancelApt && (
        <div className="admin-modal-overlay" onClick={() => setCancelApt(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#7F1D1D' }}>
              <h3>Cancel Appointment #{cancelApt.appointment_id}</h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setCancelApt(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel}>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
                  You are performing an administrative cancellation for appointment <strong>#{cancelApt.appointment_id}</strong> between <strong>{cancelApt.patient_name}</strong> and <strong>{cancelApt.doctor_name}</strong>.
                </p>

                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#172033' }}>
                  Mandatory Cancellation Rationale
                </label>
                <textarea
                  className="admin-textarea"
                  rows="3"
                  placeholder="Record justification for administrative cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setCancelApt(null)}
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  className="admin-btn danger"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
