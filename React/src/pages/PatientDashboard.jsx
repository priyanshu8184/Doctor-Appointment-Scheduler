import React, { useState } from 'react'
import './PatientDashboard.css'

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Sample data
  const upcomingAppointments = [
    { id: 1, doctorName: 'Dr. Amina Rahman', specialization: 'Cardiology', date: 'Today · 4:00 PM', status: 'Confirmed', location: 'HealPoint Medical Center' },
    { id: 2, doctorName: 'Dr. Saif Hossain', specialization: 'Neurology', date: 'Tomorrow · 10:30 AM', status: 'Confirmed', location: 'Dhaka Clinic' },
    { id: 3, doctorName: 'Dr. Nabila Karim', specialization: 'Dermatology', date: 'Friday · 1:15 PM', status: 'Pending', location: 'Sylhet Medical' },
  ]

  const appointmentHistory = [
    { id: 1, doctorName: 'Dr. Tanvir Alam', specialization: 'Pediatrics', date: '2 weeks ago', notes: 'Regular check-up' },
    { id: 2, doctorName: 'Dr. Sohana Iqbal', specialization: 'Orthopedics', date: '1 month ago', notes: 'Follow-up on knee injury' },
    { id: 3, doctorName: 'Dr. Rafiq Chowdhury', specialization: 'General Medicine', date: '2 months ago', notes: 'Blood pressure consultation' },
    { id: 4, doctorName: 'Dr. Amina Rahman', specialization: 'Cardiology', date: '3 months ago', notes: 'Cardiac check-up' },
  ]

  const payments = [
    { id: 1, date: 'Aug 5, 2026', doctorName: 'Dr. Amina Rahman', amount: '৳ 2,500', status: 'Paid', method: 'Card' },
    { id: 2, date: 'Jul 28, 2026', doctorName: 'Dr. Saif Hossain', amount: '৳ 1,800', status: 'Paid', method: 'Mobile Banking' },
    { id: 3, date: 'Jul 15, 2026', doctorName: 'Dr. Nabila Karim', amount: '৳ 1,200', status: 'Pending', method: 'Card' },
  ]

  const reviews = [
    { id: 1, doctorName: 'Dr. Tanvir Alam', rating: 5, reviewText: 'Very professional and caring. Great experience overall.', date: '2 weeks ago' },
    { id: 2, doctorName: 'Dr. Sohana Iqbal', rating: 4, reviewText: 'Good consultation, would recommend to others.', date: '1 month ago' },
    { id: 3, doctorName: 'Dr. Rafiq Chowdhury', rating: 5, reviewText: 'Excellent care and attention to detail.', date: '2 months ago' },
  ]

  const profileData = {
    name: 'Md. Hassan Khan',
    email: 'hassan.khan@email.com',
    phone: '+880-1234-567890',
    dateOfBirth: 'January 15, 1990',
    gender: 'Male',
    bloodGroup: 'O+',
    address: 'Dhaka, Bangladesh',
    emergencyContact: 'Fatima Khan (+880-1111-111111)',
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <section className="dashboard-section">
            <h2>Upcoming Appointments</h2>
            <div className="appointments-list">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-top">
                      <div>
                        <p className="appointment-doctor">{apt.doctorName}</p>
                        <p className="appointment-specialty">{apt.specialization}</p>
                      </div>
                      <span className={`appointment-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                    </div>

                    <div className="appointment-details">
                      <span>📅 {apt.date}</span>
                      <span>📍 {apt.location}</span>
                    </div>

                    <div className="appointment-actions">
                      <button type="button" className="secondary-btn">Reschedule</button>
                      <button type="button" className="secondary-btn">Cancel</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No upcoming appointments.</p>
              )}
            </div>
          </section>
        )
      case 'history':
        return (
          <section className="dashboard-section">
            <h2>Appointment History</h2>
            <div className="history-list">
              {appointmentHistory.length > 0 ? (
                appointmentHistory.map((apt) => (
                  <div key={apt.id} className="history-item">
                    <div className="history-info">
                      <p className="history-doctor">{apt.doctorName}</p>
                      <p className="history-specialty">{apt.specialization}</p>
                      <p className="history-notes">{apt.notes}</p>
                    </div>
                    <div className="history-meta">
                      <span className="history-date">{apt.date}</span>
                      <button type="button" className="secondary-btn view-details-btn">View Details</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No appointment history.</p>
              )}
            </div>
          </section>
        )
      case 'profile':
        return (
          <section className="dashboard-section">
            <h2>Your Profile</h2>
            <div className="profile-card">
              <div className="profile-header">
                <h3>{profileData.name}</h3>
                <button type="button" className="primary-btn edit-profile-btn">Edit Profile</button>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <label>Email</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="profile-item">
                  <label>Phone</label>
                  <p>{profileData.phone}</p>
                </div>
                <div className="profile-item">
                  <label>Date of Birth</label>
                  <p>{profileData.dateOfBirth}</p>
                </div>
                <div className="profile-item">
                  <label>Gender</label>
                  <p>{profileData.gender}</p>
                </div>
                <div className="profile-item">
                  <label>Blood Group</label>
                  <p>{profileData.bloodGroup}</p>
                </div>
                <div className="profile-item">
                  <label>Address</label>
                  <p>{profileData.address}</p>
                </div>
                <div className="profile-item full-width">
                  <label>Emergency Contact</label>
                  <p>{profileData.emergencyContact}</p>
                </div>
              </div>
            </div>
          </section>
        )
      case 'payments':
        return (
          <section className="dashboard-section">
            <h2>Payment History</h2>
            <div className="payments-table">
              <div className="table-header">
                <p className="col-date">Date</p>
                <p className="col-doctor">Doctor / Service</p>
                <p className="col-amount">Amount</p>
                <p className="col-status">Status</p>
                <p className="col-method">Method</p>
              </div>
              {payments.map((payment) => (
                <div key={payment.id} className="table-row">
                  <p className="col-date">{payment.date}</p>
                  <p className="col-doctor">{payment.doctorName}</p>
                  <p className="col-amount">{payment.amount}</p>
                  <p className={`col-status status-${payment.status.toLowerCase()}`}>{payment.status}</p>
                  <p className="col-method">{payment.method}</p>
                </div>
              ))}
            </div>
          </section>
        )
      case 'reviews':
        return (
          <section className="dashboard-section">
            <h2>My Reviews</h2>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div>
                        <p className="review-doctor">{review.doctorName}</p>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <p className="review-text">{review.reviewText}</p>
                  </div>
                ))
              ) : (
                <p className="empty-state">No reviews yet.</p>
              )}
            </div>

            <div className="add-review-section">
              <h3>Leave a Review</h3>
              <form className="review-form">
                <div className="form-group">
                  <label htmlFor="doctor-select">Select Doctor</label>
                  <select id="doctor-select">
                    <option>Choose a doctor...</option>
                    {appointmentHistory.map((apt) => (
                      <option key={apt.id} value={apt.doctorName}>{apt.doctorName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button key={num} type="button" className="star-btn">
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-text">Review</label>
                  <textarea id="review-text" placeholder="Share your experience..." rows="4" />
                </div>

                <button type="submit" className="primary-btn submit-review-btn">Submit Review</button>
              </form>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="patient-dashboard">
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">HealPoint</h1>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💳 Payments
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="secondary-btn logout-btn">Logout</button>
        </div>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-top">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="content-title">My Dashboard</h1>
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default PatientDashboard
