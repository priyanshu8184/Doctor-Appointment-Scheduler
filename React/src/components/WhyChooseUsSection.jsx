import React from 'react'

const reasons = [
  { title: 'Verified doctors', desc: 'Every specialist is reviewed and trusted.' },
  { title: 'Flexible scheduling', desc: 'Book appointments at your convenience.' },
  { title: 'Secure records', desc: 'Access your care history securely online.' }
]

const WhyChooseUsSection = () => {
  return (
    <section className="section-block" id="why-choose-us">
      <div className="section-heading">
        <p className="eyebrow">Why Choose Us</p>
        <h2>Designed to make healthcare stress-free.</h2>
      </div>

      <div className="benefits-grid">
        {reasons.map((reason) => (
          <article className="benefit-card" key={reason.title}>
            <h3>{reason.title}</h3>
            <p>{reason.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyChooseUsSection
