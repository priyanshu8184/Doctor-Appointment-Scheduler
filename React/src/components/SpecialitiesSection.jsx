import React from 'react'

const specialties = [
  { title: 'Cardiology', desc: 'Heart care with advanced diagnostics.' },
  { title: 'Dermatology', desc: 'Skin and hair care tailored to you.' },
  { title: 'Pediatrics', desc: 'Gentle and trusted care for children.' },
  { title: 'Orthopedics', desc: 'Joint and bone health support.' },
  { title: 'Neurology', desc: 'Specialized care for brain and nerves.' },
  { title: 'Dental Care', desc: 'Preventive and cosmetic dental services.' },
  {title:'Oncology',desc:'Specialised Care and Treatment for Cancer'},
  {title:'General Surgery',desc:'Surgery by Laser and Modern Equipment'},
  {title:'Nephrology',desc:'Kidney Care with Modern equipment'}
]

const SpecialitiesSection = () => {
  return (
    <section className="section-block" id="specialties">
      <div className="section-heading">
        <p className="eyebrow">Specialities</p>
        <h2>Explore trusted medical specialties.</h2>
      </div>

      <div className="cards-grid">
        {specialties.map((item) => (
          <article className="info-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SpecialitiesSection
