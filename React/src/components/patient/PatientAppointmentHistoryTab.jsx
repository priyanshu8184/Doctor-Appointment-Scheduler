import React from 'react'
import { History as HistoryIcon, Calendar, Star } from 'lucide-react'

const PatientAppointmentHistoryTab = ({
  appointmentHistory = [],
  reviews = [],
  onOpenRatingModal
}) => {
  return (
    <section className="dashboard-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <HistoryIcon size={18} className="section-icon" />
          <h2>Appointment History</h2>
        </div>
      </div>
      <div className="history-list">
        {appointmentHistory.length > 0 ? (
          appointmentHistory.map((apt) => {
            const existingReview = reviews.find(r => 
              String(r.appointment_id) === String(apt.id) || 
              (r.doctorName === apt.doctorName && (r.date === apt.date || String(apt.date).includes(String(r.date))))
            );

            return (
              <div key={apt.id} className="history-item">
                <div className="history-info">
                  <div className="history-title-row">
                    <p className="history-doctor">{apt.doctorName}</p>
                    {existingReview ? (
                      <span className="history-rating-badge">
                        <Star size={12} className="star-icon filled" />
                        <span>Rated {existingReview.rating}/5</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="rate-doc-btn"
                        onClick={() => onOpenRatingModal(apt)}
                        aria-label={`Rate ${apt.doctorName}`}
                      >
                        <Star size={13} className="star-icon" />
                        <span>Rate Doctor</span>
                      </button>
                    )}
                  </div>
                  <p className="history-specialty">{apt.specialization} • {apt.type === 'VIDEO' ? 'Video' : 'In-Person'}</p>
                  {apt.notes && <p className="history-notes">{apt.notes}</p>}
                  {existingReview && existingReview.reviewText && (
                    <p className="history-review-feedback">
                      <strong>Your review:</strong> "{existingReview.reviewText}"
                    </p>
                  )}
                </div>
                <div className="history-meta">
                  <span className="history-date">
                    <Calendar size={13} />
                    <span>{apt.date}</span>
                  </span>
                  <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <HistoryIcon size={32} className="empty-state-icon" />
            <h4>No appointment history</h4>
            <p>Your completed consultations and clinical records will appear here.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default PatientAppointmentHistoryTab
