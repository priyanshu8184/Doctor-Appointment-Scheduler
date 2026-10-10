import React from 'react';

const QuickBookingModal = ({
  doctor,
  onClose,
  appointmentDate,
  setAppointmentDate,
  appointmentType,
  setAppointmentType,
  bookingStatus,
  handleBookAppointment
}) => {
  if (!doctor) return null;

  return (
    <div className="booking-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(17, 28, 47, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div className="booking-modal-card" style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
        <button 
          type="button" 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748B' }}
        >
          &times;
        </button>

        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', color: '#172033' }}>Book Appointment</h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748B' }}>
          Consultation with <strong style={{ color: '#087F72' }}>{doctor.name}</strong> ({doctor.specialization})
        </p>

        <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Select Date & Time *
            </label>
            <input 
              type="datetime-local" 
              required
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Consultation Mode *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAppointmentType('VIDEO')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${appointmentType === 'VIDEO' ? '#087F72' : '#E2E8F0'}`,
                  background: appointmentType === 'VIDEO' ? 'rgba(8, 127, 114, 0.06)' : '#fff',
                  color: appointmentType === 'VIDEO' ? '#087F72' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                📹 Telemedicine Video
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType('IN_PERSON')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${appointmentType === 'IN_PERSON' ? '#087F72' : '#E2E8F0'}`,
                  background: appointmentType === 'IN_PERSON' ? 'rgba(8, 127, 114, 0.06)' : '#fff',
                  color: appointmentType === 'IN_PERSON' ? '#087F72' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🏥 In-Person Clinic
              </button>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Estimated Consultation Fee:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111C2F' }}>{doctor.fee}</span>
          </div>

          {bookingStatus && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'center',
              background: bookingStatus.includes('success') ? '#DCFCE7' : '#FEE2E2',
              color: bookingStatus.includes('success') ? '#15803D' : '#B91C1C'
            }}>
              {bookingStatus}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={bookingStatus === 'Booking...'}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#087F72', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              {bookingStatus === 'Booking...' ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickBookingModal;
