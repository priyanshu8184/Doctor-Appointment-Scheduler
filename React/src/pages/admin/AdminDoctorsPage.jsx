import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldOff,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import DoctorDetailsModal from '../../components/admin/doctors/DoctorDetailsModal';
import DoctorRejectModal from '../../components/admin/doctors/DoctorRejectModal';
import DoctorSuspendModal from '../../components/admin/doctors/DoctorSuspendModal';
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

  useEffect(() => {
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
    if (statusFilter !== 'ALL' && doc.approval_status !== statusFilter) {
      return false;
    }
    if (specialtyFilter !== 'ALL' && doc.specialization?.toLowerCase() !== specialtyFilter.toLowerCase()) {
      return false;
    }
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
      <DoctorDetailsModal
        doctor={viewDoctorModal}
        onClose={() => setViewDoctorModal(null)}
        onApprove={onApproveDoctor}
        onOpenReject={(doc) => {
          setRejectModalDoc(doc);
          setViewDoctorModal(null);
        }}
      />

      {/* 2. Rejection Modal with Reason */}
      <DoctorRejectModal
        doctor={rejectModalDoc}
        onClose={() => setRejectModalDoc(null)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirmReject={handleConfirmReject}
      />

      {/* 3. Suspend / Reactivate Confirmation Modal */}
      <DoctorSuspendModal
        doctor={suspendModalDoc}
        onClose={() => setSuspendModalDoc(null)}
        suspensionReason={suspensionReason}
        setSuspensionReason={setSuspensionReason}
        onConfirmSuspend={handleConfirmSuspend}
      />
    </div>
  );
};

export default AdminDoctorsPage;
