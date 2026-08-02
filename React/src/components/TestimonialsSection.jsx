import React from 'react'

const testimonials = [
  { name: 'Amit Raj', quote: 'Doctor bahut ache hain. Meri problem ko dhyan se suna aur sahi treatment diya. Ab kaafi better feel kar raha hu.' },
  { name: 'Ajay G. Goswami', quote: 'Doctor ka behaviour bahut friendly tha. Kam time me hi meri problem solve ho gayi.' },
  { name: 'Atharv Navlakhe', quote: 'Pehli baar itna achha medical experience hua. Doctor ne har question ka patiently answer diya.' }
]

const TestimonialsSection = () => {
  return (
    <section className="section-block" id="testimonials">
      <div className="section-heading">
        <p className="eyebrow">Testimonials</p>
        <h2>Patients love the experience.</h2>
      </div>

      <div className="cards-grid testimonial-grid">
        {testimonials.map((item) => (
          <article className="info-card" key={item.name}>
            <p>“{item.quote}”</p>
            <h3>{item.name}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
