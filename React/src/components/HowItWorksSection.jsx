import React from 'react'

const steps = [
  { title: '1. Search', desc: 'Browse doctors by specialty and location.' },
  { title: '2. Choose', desc: 'Pick the doctor and time that suits you best.' },
  { title: '3. Confirm', desc: 'Book online and receive instant confirmation.' }
]

const HowItWorksSection = () => {
  return (
    <section className="section-block" id="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">How It Works</p>
        <h2>Book appointments in three simple steps.</h2>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <article className="step-card" key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HowItWorksSection
