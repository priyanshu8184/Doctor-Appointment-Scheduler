import React from 'react'

const DoctorUpcomingTab = ({
  upcomingAppointments = [],
  onUpdateStatus,
  onJoinConsultation
}) => {
  return (
    <section className="dashboard-section">
      <h2>Upcoming Appointments</h2>
      <div className="appointments-list">
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((apt) => (
            <div key={apt.id} className="appointment-item">
              <div className="appointment-info">
                <p className="appointment-patient">{apt.patientName}</p>
                <p className="appointment-type">{apt.type}</p>
              </div>
              <div className="appointment-meta">
                <span className="appointment-time">{apt.date ? apt.date.split('T')[0] : ''} {apt.time}</span>
                {apt.status === 'SCHEDULED' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onUpdateStatus(apt.id, 'ACCEPTED')} className="primary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Accept</button>
                    <button onClick={() => onUpdateStatus(apt.id, 'REJECTED')} className="secondary-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Reject</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                    {apt.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => onJoinConsultation(apt)} 
                        className="primary-btn" 
                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#0f766e' }}
                      >
                        Join
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No upcoming appointments.</p>
        )}
      </div>
    </section>
  )
}

export default DoctorUpcomingTab
