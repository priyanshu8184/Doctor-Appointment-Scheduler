import React from 'react'

const doctors = [
  { name: 'Dr. Sarah Khan', specialty: 'Cardiology', rating: '4.9', availability: 'Next available: Today' },
  { name: 'Dr. Daniel Brooks', specialty: 'Dermatology', rating: '4.8', availability: 'Next available: Tomorrow' },
  { name: 'Dr. Aisha Patel', specialty: 'Pediatrics', rating: '5.0', availability: 'Next available: 2 PM' }
]

const TopDoctorsSection = () => {
  return (
    <section className="section-block" id="top-doctors">
      <div className="section-heading">
        <p className="eyebrow">Top Doctors</p>
        <h2>Meet highly rated doctors near you.</h2>
      </div>

      <div className="cards-grid doctor-grid">
        {doctors.map((doctor) => (
          <article className="doctor-card" key={doctor.name}>
            <div className="doctor-avatar">{doctor.name.charAt(4)}</div>
            <h3>{doctor.name}</h3>
            <p>{doctor.specialty}</p>
            <div className="doctor-meta">
              <span>⭐ {doctor.rating}</span>
              <span>{doctor.availability}</span>
            </div>
            <a className="secondary-btn" href="#appointment">
              View Profile
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TopDoctorsSection
