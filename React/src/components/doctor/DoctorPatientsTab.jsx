import React, { useState } from 'react';
import {
  Users,
  Search,
  Calendar,
  Clock,
  Video,
  Building,
  Eye,
  FileText,
  X,
  UserCheck
} from 'lucide-react';

const DoctorPatientsTab = ({
  patients = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchName = patient.name?.toLowerCase().includes(q);
    const matchEmail = patient.email?.toLowerCase().includes(q);
    return matchName || matchEmail;
  });

  const getInitials = (name) => {
    if (!name) return 'PT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="doctor-tab-container">
      <div className="doc-content-card">
        {/* Header & Controls */}
        <div className="doc-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="doc-card-title">My Patient Directory</h2>
            <p className="doc-card-subtitle">
              Patients who have scheduled or attended consultations with your clinic
            </p>
          </div>

          <div className="doc-search-box">
            <Search size={16} className="doc-search-icon" />
            <input
              type="text"
              placeholder="Search patient by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="doc-search-input"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="doc-table-scroll">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact Email</th>
                <th>Total Consultations</th>
                <th>Most Recent Visit</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const lastDate = new Date(patient.lastVisit);
                  const formattedLastVisit = !isNaN(lastDate)
                    ? lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : patient.lastVisit;

                  return (
                    <tr key={patient.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="patient-avatar-badge">
                            {getInitials(patient.name)}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#172033', fontSize: '0.95rem' }}>
                              {patient.name}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: '#087F72', fontWeight: 600 }}>
                              Verified Patient
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#475569', fontSize: '0.875rem' }}>
                          {patient.email || 'patient@healpoint.com'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserCheck size={15} color="#087F72" />
                          <span style={{ fontWeight: 600, color: '#172033' }}>
                            {patient.visits} session{patient.visits === 1 ? '' : 's'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: '#1E293B', fontWeight: 500 }}>{formattedLastVisit}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedPatient(patient)}
                          className="doc-btn secondary sm"
                          title="View patient history"
                        >
                          <Eye size={14} />
                          <span>History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                    <Users size={36} style={{ margin: '0 auto 0.75rem auto', color: '#94A3B8', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No patients found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient History Modal */}
      {selectedPatient && (
        <div className="doc-modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="doc-modal-card lg" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="patient-avatar-badge lg">
                  {getInitials(selectedPatient.name)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#172033' }}>
                    {selectedPatient.name}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                    {selectedPatient.email} • {selectedPatient.visits} Total Sessions
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="doc-modal-close"
                onClick={() => setSelectedPatient(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="doc-modal-body">
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#334155' }}>
                Consultation Records with Dr.
              </h4>

              {selectedPatient.history && selectedPatient.history.length > 0 ? (
                <div className="patient-history-timeline">
                  {selectedPatient.history.map((apt, idx) => {
                    const aptDate = new Date(apt.date);
                    const formattedDate = !isNaN(aptDate)
                      ? aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                      : apt.date;

                    return (
                      <div key={idx} className="patient-history-card">
                        <div className="history-card-left">
                          <div className="history-date-row">
                            <Calendar size={14} color="#087F72" />
                            <strong>{formattedDate}</strong>
                            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>({apt.time})</span>
                          </div>
                          <div className="history-type-row">
                            {apt.type === 'VIDEO' ? (
                              <span className="apt-mode-badge video">
                                <Video size={12} /> Video Call
                              </span>
                            ) : (
                              <span className="apt-mode-badge clinic">
                                <Building size={12} /> Hospital Visit
                              </span>
                            )}
                            <span className={`appointment-status-badge ${apt.status.toLowerCase()}`}>
                              {apt.status}
                            </span>
                          </div>
                        </div>

                        {apt.cancellation_reason && (
                          <div className="history-reason-log">
                            <strong>Note / Reason:</strong> {apt.cancellation_reason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#64748B' }}>No detailed appointment logs found.</p>
              )}
            </div>

            <div className="doc-modal-footer">
              <button
                type="button"
                className="doc-btn secondary"
                onClick={() => setSelectedPatient(null)}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientsTab;
