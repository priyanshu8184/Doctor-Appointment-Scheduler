import React, { useState } from 'react';
import { User, X, CheckCircle2 } from 'lucide-react';

const LabReportBookingModal = ({
  doctor,
  onClose,
  onConfirmBooking,
  isBooking
}) => {
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState('17:30');
  const [bookingType, setBookingType] = useState('VIDEO');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  if (!doctor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onConfirmBooking({
      doctor,
      bookingDate,
      bookingTime,
      bookingType,
      setSuccessMsg: setBookingSuccessMsg
    });
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-booking-title">
        <div className="modal-header">
          <h3 id="modal-booking-title">Book Consultation with Specialist</h3>
          <button
            type="button"
            className="close-modal-btn"
            onClick={onClose}
            aria-label="Close booking modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-doctor-summary">
          <div className="modal-doc-avatar">
            <User size={24} />
          </div>
          <div>
            <h4>{doctor.name}</h4>
            <p>{doctor.specialty} • Rating: {doctor.rating || 4.8} / 5</p>
            <p className="modal-doc-fee">Consultation Fee: ${doctor.consultation_fee || 60}.00</p>
          </div>
        </div>

        {bookingSuccessMsg ? (
          <div className="booking-success-box" role="status">
            <CheckCircle2 size={20} className="success-icon" />
            <p>{bookingSuccessMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-booking-form">
            <div className="form-group">
              <label htmlFor="booking-date">Select Date</label>
              <input
                id="booking-date"
                type="date"
                required
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="booking-time">Select Time Slot</label>
              <select
                id="booking-time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:30">05:30 PM (Earliest Available)</option>
                <option value="18:30">06:30 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>Consultation Mode</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="consultationType"
                    value="VIDEO"
                    checked={bookingType === 'VIDEO'}
                    onChange={(e) => setBookingType(e.target.value)}
                  />
                  <span>Video Consultation (Telemedicine)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="consultationType"
                    value="IN_PERSON"
                    checked={bookingType === 'IN_PERSON'}
                    onChange={(e) => setBookingType(e.target.value)}
                  />
                  <span>In-Person Clinic Visit</span>
                </label>
              </div>
            </div>

            <div className="modal-buttons-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn confirm-book-btn"
                disabled={isBooking}
              >
                {isBooking ? 'Confirming Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LabReportBookingModal;
