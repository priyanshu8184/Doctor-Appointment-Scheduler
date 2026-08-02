import React from 'react'

const testimonials = [
  { name: 'Mina R.', quote: 'I booked my checkup in minutes and the process was incredibly smooth.' },
  { name: 'Jason P.', quote: 'The doctor recommendations were accurate and the reminders were very helpful.' },
  { name: 'Priya S.', quote: 'HealPoint made finding a pediatrician easy for my family.' }
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
