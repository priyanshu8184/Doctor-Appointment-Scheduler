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
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DoctorRejectModal, DoctorAppointmentDetailsModal } from './DoctorAppointmentModal';

const DoctorTodayTab = ({
  todayAppointments = [],
  onUpdateStatus,
  onJoinConsultation
}) => {
  const [rejectApt, setRejectApt] = useState(null);
  const [viewApt, setViewApt] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Next upcoming active appointment today
  const nextApt = todayAppointments.find(a => a.status === 'SCHEDULED' || a.status === 'ACCEPTED');

  const filteredAppointments = todayAppointments.filter(apt => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return apt.status === 'PENDING' || apt.status === 'SCHEDULED';
    return apt.status === statusFilter;
  });

  return (
    <div className="doctor-tab-container">
      {/* 1. Spotlight Next Appointment Banner */}
      {nextApt ? (
        <div className="today-spotlight-card">
          <div className="spotlight-left">
            <div className="spotlight-tag">
              <Sparkles size={14} />
              <span>Next Upcoming Consultation Today</span>
            </div>
            <h3 className="spotlight-patient-name">{nextApt.patientName}</h3>
            <div className="spotlight-meta-row">
              <span className="spotlight-meta-item">
                <Clock size={15} />
                <strong>{nextApt.time}</strong>
              </span>
              <span className="spotlight-meta-item">
                {nextApt.type === 'VIDEO' ? <Video size={15} /> : <Building size={15} />}
                <span>{nextApt.type === 'VIDEO' ? 'Telemedicine Video Consultation' : 'In-Person Hospital Visit'}</span>
              </span>
              <span className={`appointment-status-badge ${nextApt.status.toLowerCase()}`}>
                {nextApt.status}
              </span>
            </div>
          </div>

          <div className="spotlight-actions">
            {nextApt.type === 'VIDEO' ? (
              <button
                type="button"
                className="doc-btn primary lg"
                onClick={() => onJoinConsultation(nextApt)}
                title="Launch WebRTC Video Room"
              >
                <Video size={18} />
                <span>Join Video Room</span>
              </button>
            ) : (
              <button
                type="button"
                className="doc-btn success lg"
                onClick={() => onUpdateStatus(nextApt.id, 'COMPLETED')}
                title="Mark consultation completed"
              >
                <CheckCircle2 size={18} />
                <span>Mark Completed</span>
              </button>
            )}
            <button
              type="button"
              className="doc-btn secondary"
              onClick={() => setViewApt(nextApt)}
            >
              <Eye size={16} />
              <span>Details</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* 2. Today's Full Schedule */}
      <div className="doc-content-card">
        <div className="doc-card-header">
          <div>
            <h2 className="doc-card-title">Today's Schedule</h2>
            <p className="doc-card-subtitle">
              {todayAppointments.length} consultation{todayAppointments.length === 1 ? '' : 's'} scheduled for today
            </p>
          </div>

          <div className="doc-filter-pills">
            <button
              type="button"
              className={`doc-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({todayAppointments.length})
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
              className={`doc-filter-pill ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('COMPLETED')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="doc-appointment-list">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => (
              <div key={apt.id} className="doc-appointment-item">
                <div className="apt-time-badge">
                  <Clock size={15} color="#087F72" />
                  <span className="apt-time-text">{apt.time}</span>
                </div>

                <div className="apt-main-info">
                  <div className="apt-patient-row">
                    <strong className="apt-patient-title">{apt.patientName}</strong>
                    <span className={`apt-mode-badge ${apt.type === 'VIDEO' ? 'video' : 'clinic'}`}>
                      {apt.type === 'VIDEO' ? <Video size={12} /> : <Building size={12} />}
                      <span>{apt.type === 'VIDEO' ? 'Video' : 'In-Person'}</span>
                    </span>
                  </div>
                  <span className="apt-subtext">{apt.patientEmail || 'Scheduled Patient'}</span>
                </div>

                <div className="apt-status-wrap">
                  <span className={`appointment-status-badge ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </div>

                <div className="apt-actions-wrap">
                  {/* Action 1: Pending Acceptance */}
                  {apt.status === 'PENDING' || apt.status === 'SCHEDULED' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'ACCEPTED')}
                        className="doc-btn success sm"
                        title="Accept Consultation"
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectApt(apt)}
                        className="doc-btn danger sm"
                        title="Decline Consultation"
                      >
                        <XCircle size={14} />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : null}

                  {/* Action 2: Confirmed / Accepted */}
                  {apt.status === 'ACCEPTED' && (
                    <>
                      {apt.type === 'VIDEO' && (
                        <button
                          type="button"
                          onClick={() => onJoinConsultation(apt)}
                          className="doc-btn primary sm"
                          title="Join Live WebRTC Video Room"
                        >
                          <Video size={14} />
                          <span>Join Call</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'COMPLETED')}
                        className="doc-btn success sm"
                        title="Mark Completed"
                      >
                        <CheckCircle2 size={14} />
                        <span>Complete</span>
                      </button>
                    </>
                  )}

                  {/* Action 3: View Details */}
                  <button
                    type="button"
                    onClick={() => setViewApt(apt)}
                    className="doc-btn secondary sm"
                    title="View Full Appointment Info"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="doc-empty-state">
              <Calendar size={36} color="#94A3B8" />
              <h3>No appointments scheduled for today</h3>
              <p>You have no clinical sessions booked for the remainder of today.</p>
            </div>
          )}
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

export default DoctorTodayTab;
