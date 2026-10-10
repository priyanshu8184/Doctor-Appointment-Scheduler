import React, { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Building, 
  Stethoscope, 
  UploadCloud, 
  ChevronRight, 
  FileText 
} from 'lucide-react'

const PatientUpcomingAppointmentsTab = ({
  upcomingAppointments = [],
  nextAppointment,
  onJoinConsultation,
  onReschedule,
  onCancel,
  onOpenReportAnalyzer,
  navigate
}) => {
  const [rescheduleId, setRescheduleId] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')

  const handleSaveReschedule = (id) => {
    if (!rescheduleDate) {
      alert("Please select a new date and time.")
      return
    }
    onReschedule(id, rescheduleDate)
    setRescheduleId(null)
    setRescheduleDate('')
  }

  return (
    <div className="dashboard-view-stack">
      {/* 1. Next Appointment Highlight Card (when available) */}
      {nextAppointment && (
        <div className="next-appointment-hero">
          <div className="next-apt-header">
            <div className="next-apt-badge">
              <Clock size={13} />
              <span>Next Upcoming Appointment</span>
            </div>
            <span className={`appointment-status ${nextAppointment.status.toLowerCase()}`}>
              {nextAppointment.status}
            </span>
          </div>
          <div className="next-apt-body">
            <div className="next-apt-doc-block">
              <div className="next-apt-avatar">
                <Stethoscope size={20} />
              </div>
              <div>
                <h3 className="next-apt-doctor">{nextAppointment.doctorName}</h3>
                <p className="next-apt-spec">{nextAppointment.specialization}</p>
              </div>
            </div>
            <div className="next-apt-meta-grid">
              <div className="meta-pill">
                <Calendar size={14} />
                <span>{nextAppointment.date}</span>
              </div>
              <div className="meta-pill">
                <Clock size={14} />
                <span>{nextAppointment.time}</span>
              </div>
              <div className="meta-pill">
                {nextAppointment.type === 'VIDEO' ? <Video size={14} /> : <Building size={14} />}
                <span>{nextAppointment.type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Clinic'}</span>
              </div>
              <div className="meta-pill">
                <MapPin size={14} />
                <span>{nextAppointment.location}</span>
              </div>
            </div>
          </div>
          <div className="next-apt-actions">
            {nextAppointment.status === 'ACCEPTED' && (
              <button 
                type="button" 
                className="primary-btn join-btn"
                onClick={() => onJoinConsultation(nextAppointment)}
              >
                <Video size={15} />
                <span>Join Video Consultation</span>
              </button>
            )}
            {rescheduleId === nextAppointment.id ? (
              <div className="inline-reschedule-form">
                <input 
                  type="datetime-local" 
                  value={rescheduleDate} 
                  onChange={(e) => setRescheduleDate(e.target.value)} 
                />
                <button type="button" className="primary-btn sm" onClick={() => handleSaveReschedule(nextAppointment.id)}>Save</button>
                <button type="button" className="secondary-btn sm" onClick={() => setRescheduleId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <button 
                  type="button" 
                  className="secondary-btn" 
                  onClick={() => { setRescheduleId(nextAppointment.id); setRescheduleDate(''); }}
                >
                  Reschedule
                </button>
                <button 
                  type="button" 
                  className="secondary-btn danger-hover" 
                  onClick={() => onCancel(nextAppointment.id)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Prominent AI Lab Report Analyzer Card */}
      <div 
        className="lab-analyzer-feature-card" 
        onClick={onOpenReportAnalyzer}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenReportAnalyzer(); }}
        aria-label="Open AI Lab Report Analyzer"
      >
        <div className="feature-card-content">
          <div className="feature-badge">
            <FileText size={13} />
            <span>Clinical Diagnostics</span>
          </div>
          <h3 className="feature-title">AI Lab Report Analyzer</h3>
          <p className="feature-description">
            Upload blood work, lipid panels, thyroid tests, or metabolic reports to extract biomarker values, identify abnormal findings, and match with relevant clinical specialists.
          </p>
          <div className="feature-actions">
            <button 
              type="button" 
              className="feature-btn primary"
              onClick={(e) => { e.stopPropagation(); onOpenReportAnalyzer(); }}
            >
              <UploadCloud size={15} />
              <span>Upload Lab Report</span>
            </button>
            <button 
              type="button" 
              className="feature-btn secondary"
              onClick={(e) => { e.stopPropagation(); onOpenReportAnalyzer(); }}
            >
              <span>Try Demo Report</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="feature-format-card">
          <FileText size={28} className="format-icon" />
          <span className="format-title">PDF • JPG • PNG</span>
          <span className="format-limit">Max 10MB</span>
        </div>
      </div>

      {/* 3. Upcoming Appointments Section */}
      <section className="dashboard-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <Calendar size={18} className="section-icon" />
            <h2>Upcoming Appointments</h2>
          </div>
          <button 
            type="button" 
            className="section-link-btn"
            onClick={() => { if (navigate) navigate('/doctors'); else window.location.href = '/doctors'; }}
          >
            <span>Book New Appointment</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="appointments-list">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-top">
                  <div className="appointment-doctor-group">
                    <p className="appointment-doctor">{apt.doctorName}</p>
                    <p className="appointment-specialty">{apt.specialization} • {apt.type === 'VIDEO' ? 'Video' : 'In-Person'}</p>
                  </div>
                  <div className="appointment-status-wrap">
                    <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                    {apt.status === 'REJECTED' && <span className="status-note danger">On waiting list</span>}
                    {apt.status === 'ACCEPTED' && <span className="status-note success">Doctor confirmed</span>}
                  </div>
                </div>

                <div className="appointment-details">
                  <span className="detail-item">
                    <Calendar size={14} />
                    <span>{apt.date} at {apt.time}</span>
                  </span>
                  <span className="detail-item">
                    <MapPin size={14} />
                    <span>{apt.location}</span>
                  </span>
                </div>

                <div className="appointment-actions">
                  {apt.status === 'ACCEPTED' && (
                    <button 
                      type="button" 
                      className="primary-btn join-btn" 
                      onClick={() => onJoinConsultation(apt)}
                    >
                      <Video size={14} />
                      <span>Join Consultation</span>
                    </button>
                  )}
                  {rescheduleId === apt.id ? (
                    <div className="inline-reschedule-form">
                      <input 
                        type="datetime-local" 
                        value={rescheduleDate} 
                        onChange={(e) => setRescheduleDate(e.target.value)} 
                      />
                      <button type="button" className="primary-btn sm" onClick={() => handleSaveReschedule(apt.id)}>Save</button>
                      <button type="button" className="secondary-btn sm" onClick={() => setRescheduleId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="secondary-btn" 
                        onClick={() => { setRescheduleId(apt.id); setRescheduleDate(''); }}
                      >
                        Reschedule
                      </button>
                      <button 
                        type="button" 
                        className="secondary-btn danger-hover" 
                        onClick={() => onCancel(apt.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calendar size={32} className="empty-state-icon" />
              <h4>No upcoming appointments</h4>
              <p>Schedule a video or in-person consultation with our certified doctors.</p>
              <button 
                type="button" 
                className="primary-btn" 
                onClick={() => { if (navigate) navigate('/doctors'); else window.location.href = '/doctors'; }}
              >
                Find a Doctor
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default PatientUpcomingAppointmentsTab
