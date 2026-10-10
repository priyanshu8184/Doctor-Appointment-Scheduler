import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ShieldOff,
  ShieldCheck,
  Stethoscope,
  X,
  FileText,
  Clock,
  User,
  MapPin,
  DollarSign,
  Award
} from 'lucide-react';
import './AdminPages.css';

const AdminDoctorsPage = ({ 
  doctors = [], 
  onApproveDoctor, 
  onRejectDoctor, 
  onUpdateDoctorStatus,
  loading = false,
  initialStatusFilter = 'ALL'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');

  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Modals state
  const [viewDoctorModal, setViewDoctorModal] = useState(null);
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspendModalDoc, setSuspendModalDoc] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Calculate counts for badges
  const pendingCount = doctors.filter(d => d.approval_status === 'PENDING').length;
  const approvedCount = doctors.filter(d => d.approval_status === 'APPROVED').length;
  const suspendedCount = doctors.filter(d => d.approval_status === 'SUSPENDED').length;
  const rejectedCount = doctors.filter(d => d.approval_status === 'REJECTED').length;

  // Filter doctors
  const filteredDoctors = doctors.filter(doc => {
    // Status filter
    if (statusFilter !== 'ALL' && doc.approval_status !== statusFilter) {
      return false;
    }
    // Specialty filter
    if (specialtyFilter !== 'ALL' && doc.specialization?.toLowerCase() !== specialtyFilter.toLowerCase()) {
      return false;
    }
    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `dr. ${doc.first_name} ${doc.last_name}`.toLowerCase().includes(q);
      const matchEmail = doc.email?.toLowerCase().includes(q);
      const matchSpec = doc.specialization?.toLowerCase().includes(q);
      const matchLicense = doc.medical_license_number?.toLowerCase().includes(q);
      return matchName || matchEmail || matchSpec || matchLicense;
    }
    return true;
  });

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectModalDoc) return;
    onRejectDoctor(rejectModalDoc, rejectionReason);
    setRejectModalDoc(null);
    setRejectionReason('');
  };

  const handleConfirmSuspend = (e) => {
    e.preventDefault();
    if (!suspendModalDoc) return;
    const targetStatus = suspendModalDoc.approval_status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    onUpdateDoctorStatus(suspendModalDoc.doctor_id, targetStatus, suspensionReason);
    setSuspendModalDoc(null);
    setSuspensionReason('');
  };

  const specialtiesList = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  return (
    <div className="admin-doctors-view">
      {/* Top Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by doctor name, specialty, license no..."
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
            <span>All ({doctors.length})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            <span>Pending</span>
            {pendingCount > 0 && <span className="filter-tab-badge">{pendingCount}</span>}
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            <span>Approved ({approvedCount})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'SUSPENDED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('SUSPENDED')}
          >
            <span>Suspended ({suspendedCount})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <Stethoscope size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Doctor Verification & Directory Roster</h3>
              <p className="admin-card-subtitle">
                Showing {filteredDoctors.length} practitioner{filteredDoctors.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Medical License</th>
                <th>Experience & Fee</th>
                <th>Verification Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <tr key={doc.doctor_id}>
                    <td>
                      <div>
                        <strong style={{ display: 'block', color: '#172033' }}>
                          Dr. {doc.first_name} {doc.last_name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{doc.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge scheduled">{doc.specialization}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#334155' }}>
                        {doc.medical_license_number || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <span>{doc.experience_years || 5}+ yrs exp</span> • <strong>${doc.consultation_fee}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${doc.approval_status.toLowerCase()}`}>
                        {doc.approval_status}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {doc.created_at?.split('T')[0] || 'N/A'}
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-btn secondary sm"
                          onClick={() => setViewDoctorModal(doc)}
                          title="View Complete Profile & Qualifications"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {doc.approval_status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              className="admin-btn success sm"
                              onClick={() => onApproveDoctor(doc.doctor_id)}
                              title="Approve Practitioner for Booking"
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="admin-btn danger sm"
                              onClick={() => {
                                setRejectModalDoc(doc);
                                setRejectionReason('');
                              }}
                              title="Reject Application"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {doc.approval_status === 'APPROVED' && (
                          <button
                            type="button"
                            className="admin-btn danger sm"
                            onClick={() => {
                              setSuspendModalDoc(doc);
                              setSuspensionReason('');
                            }}
                            title="Suspend Doctor Account"
                          >
                            <ShieldOff size={13} />
                            <span>Suspend</span>
                          </button>
                        )}

                        {doc.approval_status === 'SUSPENDED' && (
                          <button
                            type="button"
                            className="admin-btn success sm"
                            onClick={() => {
                              setSuspendModalDoc(doc);
                              setSuspensionReason('');
                            }}
                            title="Reactivate Doctor Account"
                          >
                            <ShieldCheck size={13} />
                            <span>Reactivate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    <Stethoscope size={32} style={{ margin: '0 auto 0.5rem auto', color: '#94A3B8', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No doctors matched your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Doctor Profile Inspection Modal */}
      {viewDoctorModal && (
        <div className="admin-modal-overlay" onClick={() => setViewDoctorModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Doctor Professional Credentials & Details</h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setViewDoctorModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Practitioner Name</span>
                  <span className="admin-detail-value">Dr. {viewDoctorModal.first_name} {viewDoctorModal.last_name}</span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Email Address</span>
                  <span className="admin-detail-value">{viewDoctorModal.email}</span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Primary Specialty</span>
                  <span className="admin-detail-value">{viewDoctorModal.specialization}</span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Medical License No.</span>
                  <span className="admin-detail-value" style={{ fontFamily: 'monospace' }}>
                    {viewDoctorModal.medical_license_number || 'MED-LIC-PENDING'}
                  </span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Qualifications</span>
                  <span className="admin-detail-value">{viewDoctorModal.qualifications || 'MBBS, MD'}</span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Clinical Experience</span>
                  <span className="admin-detail-value">{viewDoctorModal.experience_years || 8} Years</span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Consultation Fee</span>
                  <span className="admin-detail-value">${viewDoctorModal.consultation_fee}</span>
                </div>
                <div className="admin-detail-field">
                  <span className="admin-detail-label">Practice Location</span>
                  <span className="admin-detail-value">{viewDoctorModal.location}</span>
                </div>
                <div className="admin-detail-field full">
                  <span className="admin-detail-label">Professional Biography</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                    {viewDoctorModal.bio}
                  </p>
                </div>
                {viewDoctorModal.rejection_reason && (
                  <div className="admin-detail-field full" style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px' }}>
                    <span className="admin-detail-label" style={{ color: '#B91C1C' }}>Rejection Reason Log</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#991B1B' }}>
                      {viewDoctorModal.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => setViewDoctorModal(null)}
              >
                Close
              </button>
              {viewDoctorModal.approval_status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() => {
                      setRejectModalDoc(viewDoctorModal);
                      setViewDoctorModal(null);
                    }}
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    className="admin-btn success"
                    onClick={() => {
                      onApproveDoctor(viewDoctorModal.doctor_id);
                      setViewDoctorModal(null);
                    }}
                  >
                    Approve Practitioner
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Rejection Modal with Reason */}
      {rejectModalDoc && (
        <div className="admin-modal-overlay" onClick={() => setRejectModalDoc(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#7F1D1D' }}>
              <h3>Reject Doctor Registration Application</h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setRejectModalDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
                  You are rejecting the registration for <strong>Dr. {rejectModalDoc.first_name} {rejectModalDoc.last_name}</strong>. Please provide a clear audit rationale for clinical record integrity:
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
                  onClick={() => setRejectModalDoc(null)}
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
      )}

      {/* 3. Suspend / Reactivate Confirmation Modal */}
      {suspendModalDoc && (
        <div className="admin-modal-overlay" onClick={() => setSuspendModalDoc(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: suspendModalDoc.approval_status === 'SUSPENDED' ? '#065F46' : '#7F1D1D' }}>
              <h3>
                {suspendModalDoc.approval_status === 'SUSPENDED' 
                  ? 'Reactivate Doctor Account' 
                  : 'Suspend Doctor Account'}
              </h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setSuspendModalDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspend}>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
                  {suspendModalDoc.approval_status === 'SUSPENDED'
                    ? `Are you sure you want to reactivate Dr. ${suspendModalDoc.first_name} ${suspendModalDoc.last_name}? They will be able to accept new consultations immediately.`
                    : `Suspending Dr. ${suspendModalDoc.first_name} ${suspendModalDoc.last_name} will temporarily prevent new appointments while preserving past records.`
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
                  onClick={() => setSuspendModalDoc(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={suspendModalDoc.approval_status === 'SUSPENDED' ? 'admin-btn success' : 'admin-btn danger'}
                >
                  Confirm {suspendModalDoc.approval_status === 'SUSPENDED' ? 'Reactivation' : 'Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorsPage;
