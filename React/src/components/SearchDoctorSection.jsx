import React from 'react'

const SearchDoctorSection = ({ navigate }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const search = e.target[0].value;
    const location = e.target[1].value;
    const availability = e.target[2].value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (availability) params.append('availability', availability);

    if (navigate) {
      navigate(`/doctors?${params.toString()}`);
    }
  };

  return (
    <section className="section-block" id="search-doctor">
      <div className="section-heading">
        <p className="eyebrow">Search Doctor</p>
        <h2>Find the right doctor as per your need.</h2>
      </div>

      <form className="search-card" onSubmit={handleSubmit}>
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
            <option value="Indore">Indore</option>
            <option value="Bhopal">Bhopal</option>
            <option value="Varansi">Varansi</option>
            <option value="Patna">Patna</option>
            <option value="Motihari">Motihari</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Delhi">Delhi</option>
            <option value="Ahmedabad">Ahmedabad</option>
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
