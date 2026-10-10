import React, { useState } from 'react';
import {
  Search,
  Users,
  ShieldCheck,
  ShieldOff,
  User,
  Calendar,
  Phone,
  Mail,
  X,
  AlertCircle
} from 'lucide-react';
import './AdminPages.css';

const AdminPatientsPage = ({ 
  patients = [], 
  onUpdatePatientStatus,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [targetPatient, setTargetPatient] = useState(null);
  const [reason, setReason] = useState('');

  const activeCount = patients.filter(p => p.account_status === 'ACTIVE').length;
  const suspendedCount = patients.filter(p => p.account_status === 'SUSPENDED').length;

  const filteredPatients = patients.filter(p => {
    if (statusFilter !== 'ALL' && p.account_status !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${p.first_name} ${p.last_name}`.toLowerCase().includes(q);
      const matchEmail = p.email?.toLowerCase().includes(q);
      const matchPhone = p.phone_number?.includes(q);
      return matchName || matchEmail || matchPhone;
    }
    return true;
  });

  const handleConfirmStatusChange = (e) => {
    e.preventDefault();
    if (!targetPatient) return;
    const targetStatus = targetPatient.account_status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    onUpdatePatientStatus(targetPatient.patient_id, targetStatus, reason);
    setTargetPatient(null);
    setReason('');
  };

  return (
    <div className="admin-patients-view">
      {/* Top Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by patient name, email, phone..."
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
            <span>All ({patients.length})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            <span>Active ({activeCount})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${statusFilter === 'SUSPENDED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('SUSPENDED')}
          >
            <span>Suspended ({suspendedCount})</span>
          </button>
        </div>
      </div>

      {/* Main Card & Table */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <Users size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Registered Patient Accounts</h3>
              <p className="admin-card-subtitle">
                Displaying {filteredPatients.length} patient profile{filteredPatients.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Contact Details</th>
                <th>Demographics</th>
                <th>Total Bookings</th>
                <th>Account Status</th>
                <th>Registered Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td>
                      <div>
                        <strong style={{ display: 'block', color: '#172033' }}>
                          {patient.first_name} {patient.last_name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: #{patient.patient_id}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
                        <div>{patient.email}</div>
                        <div style={{ color: '#64748B' }}>{patient.phone_number || 'No phone'}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <span>{patient.gender || 'N/A'}</span> • <span>Blood: {patient.blood_group || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge scheduled">
                        {patient.total_appointments || 0} Consultations
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${patient.account_status.toLowerCase()}`}>
                        {patient.account_status}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {patient.created_at?.split('T')[0] || 'N/A'}
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {patient.account_status === 'ACTIVE' ? (
                          <button
                            type="button"
                            className="admin-btn danger sm"
                            onClick={() => {
                              setTargetPatient(patient);
                              setReason('');
                            }}
                            title="Suspend patient account"
                          >
                            <ShieldOff size={13} />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn success sm"
                            onClick={() => {
                              setTargetPatient(patient);
                              setReason('');
                            }}
                            title="Reactivate patient account"
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
                    <Users size={32} style={{ margin: '0 auto 0.5rem auto', color: '#94A3B8', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No patients matched your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Status Modal */}
      {targetPatient && (
        <div className="admin-modal-overlay" onClick={() => setTargetPatient(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: targetPatient.account_status === 'SUSPENDED' ? '#065F46' : '#7F1D1D' }}>
              <h3>
                {targetPatient.account_status === 'SUSPENDED' 
                  ? 'Reactivate Patient Account' 
                  : 'Suspend Patient Account'}
              </h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setTargetPatient(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusChange}>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#334155' }}>
                  {targetPatient.account_status === 'SUSPENDED'
                    ? `Are you sure you want to reactivate the account for ${targetPatient.first_name} ${targetPatient.last_name}?`
                    : `Suspending ${targetPatient.first_name} ${targetPatient.last_name} will temporarily restrict login access while preserving all medical booking records.`
                  }
                </p>

                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#172033' }}>
                  Administrative Note / Reason (Optional)
                </label>
                <textarea
                  className="admin-textarea"
                  rows="2"
                  placeholder="Record reason for account status update..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setTargetPatient(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={targetPatient.account_status === 'SUSPENDED' ? 'admin-btn success' : 'admin-btn danger'}
                >
                  Confirm {targetPatient.account_status === 'SUSPENDED' ? 'Reactivation' : 'Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatientsPage;
