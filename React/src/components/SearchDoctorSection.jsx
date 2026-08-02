import React from 'react'

const SearchDoctorSection = () => {
  return (
    <section className="section-block" id="search-doctor">
      <div className="section-heading">
        <p className="eyebrow">Search Doctor</p>
        <h2>Find the right doctor for your needs.</h2>
      </div>

      <form className="search-card">
        <div className="search-field">
          <label>Doctor or specialty</label>
          <input type="text" placeholder="Cardiologist, dentist, pediatrics..." />
        </div>
        <div className="search-field">
          <label>Location</label>
          <select defaultValue="">
            <option value="" disabled>
              Choose city
            </option>
            <option value="new-york">New York</option>
            <option value="los-angeles">Los Angeles</option>
            <option value="chicago">Chicago</option>
          </select>
        </div>
        <div className="search-field">
          <label>Availability</label>
          <select defaultValue="">
            <option value="" disabled>
              Select date
            </option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="weekend">This weekend</option>
          </select>
        </div>
        <button className="primary-btn search-btn" type="submit">
          Find Doctor
        </button>
      </form>
    </section>
  )
}

export default SearchDoctorSection
