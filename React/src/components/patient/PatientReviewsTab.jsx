import React, { useState } from 'react'
import { Star } from 'lucide-react'

const PatientReviewsTab = ({
  reviews = [],
  completedAppointments = [],
  onSubmitReview
}) => {
  const [reviewForm, setReviewForm] = useState({ appointmentId: '', rating: 5, comment: '' })

  const getRatingLabel = (score) => {
    switch (score) {
      case 5: return '5 ★ - Excellent experience, highly recommend!'
      case 4: return '4 ★ - Very good consultation'
      case 3: return '3 ★ - Average / Satisfactory'
      case 2: return '2 ★ - Below expectations'
      case 1: return '1 ★ - Unsatisfactory visit'
      default: return 'Select star rating'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.appointmentId) {
      alert("Please select an appointment")
      return
    }
    await onSubmitReview(reviewForm)
    setReviewForm({ appointmentId: '', rating: 5, comment: '' })
  }

  return (
    <section className="dashboard-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <Star size={18} className="section-icon" />
          <h2>Doctor Consultations & Ratings</h2>
        </div>
      </div>
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div>
                  <p className="review-doctor">{review.doctorName}</p>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < review.rating ? 'star filled' : 'star'} 
                      />
                    ))}
                  </div>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-text">{review.reviewText}</p>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Star size={32} className="empty-state-icon" />
            <h4>No reviews submitted yet</h4>
            <p>Leave feedback for your past consultations to help improve clinical service.</p>
          </div>
        )}
      </div>

      <div className="add-review-section">
        <h3>Rate a Doctor / Completed Visit</h3>
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="doctor-select">Select Completed Appointment</label>
            <select 
              id="doctor-select" 
              value={reviewForm.appointmentId} 
              onChange={e => setReviewForm({...reviewForm, appointmentId: e.target.value})}
            >
              <option value="">Choose a completed appointment...</option>
              {completedAppointments.map((apt) => (
                <option key={apt.id} value={apt.id}>{apt.date} - {apt.doctorName} ({apt.specialization})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Rating Score</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((num) => (
                <button 
                  key={num} 
                  type="button" 
                  className={`star-btn ${num <= reviewForm.rating ? 'filled' : ''}`}
                  onClick={() => setReviewForm({...reviewForm, rating: num})}
                  aria-label={`Rate ${num} stars`}
                >
                  <Star size={20} className={num <= reviewForm.rating ? 'star-filled' : 'star-empty'} />
                </button>
              ))}
            </div>
            <span className="rating-label-hint">{getRatingLabel(reviewForm.rating)}</span>
          </div>

          <div className="form-group">
            <label htmlFor="review-text">Review Comments</label>
            <textarea 
              id="review-text" 
              placeholder="Share your experience regarding the consultation, doctor attentiveness, and diagnosis..." 
              rows="3" 
              value={reviewForm.comment}
              onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
            />
          </div>

          <button type="submit" className="primary-btn submit-review-btn">
            <Star size={15} />
            <span>Submit Review</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default PatientReviewsTab
