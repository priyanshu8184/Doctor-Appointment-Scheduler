import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Building,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  Search,
  Filter,
  User
} from 'lucide-react';
import { DoctorRejectModal, DoctorAppointmentDetailsModal } from './DoctorAppointmentModal';

const DoctorUpcomingTab = ({
  upcomingAppointments = [],
  onUpdateStatus,
  onJoinConsultation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const [rejectApt, setRejectApt] = useState(null);
  const [viewApt, setViewApt] = useState(null);

  const filteredAppointments = upcomingAppointments.filter(apt => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACCEPTED' && apt.status !== 'ACCEPTED' && apt.status !== 'CONFIRMED') return false;
      if (statusFilter === 'PENDING' && apt.status !== 'PENDING' && apt.status !== 'SCHEDULED') return false;
      if (statusFilter === 'COMPLETED' && apt.status !== 'COMPLETED') return false;
      if (statusFilter === 'CANCELLED' && apt.status !== 'CANCELLED' && apt.status !== 'REJECTED') return false;
    }

    if (typeFilter !== 'ALL' && apt.type !== typeFilter) return false;

    if (dateFilter && apt.date) {
      if (!apt.date.startsWith(dateFilter)) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = apt.patientName?.toLowerCase().includes(q);
      const matchId = String(apt.id).includes(q);
      return matchName || matchId;
    }

    return true;
  });

  return (
    <div className="doctor-tab-container">
      <div className="doc-content-card">
        {/* Card Header & Controls */}
        <div className="doc-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="doc-card-title">All & Upcoming Appointments</h2>
            <p className="doc-card-subtitle">
              Monitor, confirm, and manage your platform bookings
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div className="doc-search-box">
              <Search size={16} className="doc-search-icon" />
              <input
                type="text"
                placeholder="Search patient name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="doc-search-input"
              />
            </div>

            {/* Type Selector */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="doc-select-input"
            >
              <option value="ALL">All Types</option>
              <option value="VIDEO">📹 Video Only</option>
              <option value="IN_PERSON">🏥 Clinic Only</option>
            </select>

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="doc-date-input"
              title="Filter by Date"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="doc-filter-pills" style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`doc-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({upcomingAppointments.length})
          </button>
          <button
            type="button"
            className={`doc-filter-pill ${statusFilter === 'ACCEPTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACCEPTED')}
          >
            Confirmed
          </button>
          <button
            type="button"
            className={`doc-filter-pill ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending Action
          </button>
          <button
            type="button"
            className={`doc-filter-pill ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed
          </button>
          <button
            type="button"
            className={`doc-filter-pill ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CANCELLED')}
          >
            Cancelled
          </button>
        </div>

        {/* Appointment Table */}
        <div className="doc-table-scroll">
          <table className="doc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Scheduled Date & Time</th>
                <th>Consultation Mode</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(apt => {
                  const aptDate = new Date(apt.date);
                  const formattedDate = !isNaN(aptDate) ? aptDate.toLocaleDateString() : 'N/A';

                  return (
                    <tr key={apt.id}>
                      <td>
                        <span className="apt-id-tag">#{apt.id}</span>
                      </td>
                      <td>
                        <div>
                          <strong style={{ display: 'block', color: '#172033' }}>{apt.patientName}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{apt.patientEmail || 'Verified Patient'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600, color: '#172033' }}>{formattedDate}</div>
                          <div style={{ color: '#087F72', fontSize: '0.75rem', fontWeight: 600 }}>{apt.time}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`apt-mode-badge ${apt.type === 'VIDEO' ? 'video' : 'clinic'}`}>
                          {apt.type === 'VIDEO' ? <Video size={12} /> : <Building size={12} />}
                          <span>{apt.type === 'VIDEO' ? 'Video' : 'In-Person'}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`appointment-status-badge ${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <div className="doc-actions-cell">
                          {/* Pending Actions */}
                          {(apt.status === 'PENDING' || apt.status === 'SCHEDULED') && (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(apt.id, 'ACCEPTED')}
                                className="doc-btn success sm"
                                title="Accept Consultation"
                              >
                                <Check size={13} />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectApt(apt)}
                                className="doc-btn danger sm"
                                title="Decline Consultation"
                              >
                                <XCircle size={13} />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {/* Confirmed Video Action */}
                          {apt.status === 'ACCEPTED' && apt.type === 'VIDEO' && (
                            <button
                              type="button"
                              onClick={() => onJoinConsultation(apt)}
                              className="doc-btn primary sm"
                              title="Join Video Room"
                            >
                              <Video size={13} />
                              <span>Join</span>
                            </button>
                          )}

                          {/* Details */}
                          <button
                            type="button"
                            onClick={() => setViewApt(apt)}
                            className="doc-btn secondary sm"
                            title="View Information"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    <Calendar size={32} style={{ margin: '0 auto 0.5rem auto', color: '#94A3B8', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No appointments matched your query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      <DoctorRejectModal
        appointment={rejectApt}
        onClose={() => setRejectApt(null)}
        onConfirmReject={(id, reason) => {
          onUpdateStatus(id, 'REJECTED', reason);
          setRejectApt(null);
        }}
      />

      {/* Details Modal */}
      <DoctorAppointmentDetailsModal
        appointment={viewApt}
        onClose={() => setViewApt(null)}
        onJoinConsultation={onJoinConsultation}
      />
    </div>
  );
};

export default DoctorUpcomingTab;
