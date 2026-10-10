import React, { useState } from 'react'

const DoctorAvailabilityTab = ({
  availabilitySlots = [],
  onAddAvailability,
  onDeleteAvailability
}) => {
  const [availFormType, setAvailFormType] = useState('SPECIFIC_DATE')
  const [availFormDay, setAvailFormDay] = useState('MONDAY')
  const [availFormDate, setAvailFormDate] = useState('')
  const [availFormStatus, setAvailFormStatus] = useState('AVAILABLE')
  const [availFormStart, setAvailFormStart] = useState('')
  const [availFormEnd, setAvailFormEnd] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onAddAvailability({
      availFormType,
      availFormDay,
      availFormDate,
      availFormStatus,
      availFormStart,
      availFormEnd
    })
  }

  return (
    <section className="dashboard-section">
      <h2>Your Availability</h2>
      
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Add New Rule</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
            Rule Type
            <select value={availFormType} onChange={(e) => setAvailFormType(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="SPECIFIC_DATE">Specific Date</option>
              <option value="RECURRING">Recurring Weekly</option>
            </select>
          </label>

          {availFormType === 'RECURRING' ? (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
              Day of Week
              <select value={availFormDay} onChange={(e) => setAvailFormDay(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </label>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
              Select Date
              <input type="date" value={availFormDate} onChange={(e) => setAvailFormDate(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </label>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600 }}>
            Status
            <select value={availFormStatus} onChange={(e) => setAvailFormStatus(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable (Block)</option>
            </select>
          </label>

          {availFormStatus === 'AVAILABLE' ? (
            <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, flex: 1 }}>
                Start Time
                <input type="time" value={availFormStart} onChange={(e) => setAvailFormStart(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, flex: 1 }}>
                End Time
                <input type="time" value={availFormEnd} onChange={(e) => setAvailFormEnd(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </label>
            </div>
          ) : null}

          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <button type="submit" className="primary-btn">Add Availability Rule</button>
          </div>
        </form>
      </div>

      <div className="availability-grid">
        {availabilitySlots.map((slot, idx) => (
          <div key={idx} className="availability-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <p className="availability-day">{slot.day}</p>
            <p className="availability-time" style={{ color: slot.is_available ? '#334155' : '#ef4444', fontWeight: slot.is_available ? 500 : 700 }}>
              {slot.slots}
            </p>
            <button type="button" onClick={() => onDeleteAvailability(slot.id)} className="secondary-btn edit-slot-btn" style={{ marginTop: 'auto', border: '1px solid #ef4444', color: '#ef4444', background: '#fef2f2' }}>Delete</button>
          </div>
        ))}
        {availabilitySlots.length === 0 && (
          <p>No availability rules set.</p>
        )}
      </div>
    </section>
  )
}

export default DoctorAvailabilityTab
