import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import SearchDoctorSection from '../components/SearchDoctorSection'
import SpecialitiesSection from '../components/SpecialitiesSection'
import TopDoctorsSection from '../components/TopDoctorsSection'
import WhyChooseUsSection from '../components/WhyChooseUsSection'
import HowItWorksSection from '../components/HowItWorksSection'
import TestimonialsSection from '../components/TestimonialsSection'
import './Homepage.css'

const Homepage = () => {
  return (
    <div className="landing-page" id="home">
      <Navbar />

      <main>
        <HeroSection />
        <SearchDoctorSection />
        <SpecialitiesSection />
        <TopDoctorsSection />
        <WhyChooseUsSection />
        <HowItWorksSection />
        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  )
}

export default Homepage
