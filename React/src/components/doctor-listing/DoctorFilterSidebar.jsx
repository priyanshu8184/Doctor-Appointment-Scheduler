import React from 'react';

const DoctorFilterSidebar = ({
  searchTerm,
  setSearchTerm,
  selectedSpecialization,
  setSelectedSpecialization,
  selectedLocation,
  setSelectedLocation,
  selectedAvailability,
  setSelectedAvailability,
  specializations,
  locations,
  availabilityOptions,
  applyFilters,
  resetFilters
}) => {
  return (
    <section className="filters-card" aria-label="Doctor filters">
      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search by name or specialty"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="specialization">Filter by Specialization</label>
        <select
          id="specialization"
          value={selectedSpecialization}
          onChange={(event) => setSelectedSpecialization(event.target.value)}
        >
          {specializations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="location">Filter by Location</label>
        <select
          id="location"
          value={selectedLocation}
          onChange={(event) => setSelectedLocation(event.target.value)}
        >
          {locations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="availability">Availability</label>
        <select
          id="availability"
          value={selectedAvailability}
          onChange={(event) => setSelectedAvailability(event.target.value)}
        >
          {availabilityOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', paddingBottom: '2px' }}>
        <button 
          type="button" 
          className="primary-btn search-btn" 
          onClick={applyFilters} 
          style={{ padding: '0.8rem 1.2rem', height: '100%' }}
        >
          Find Doctor
        </button>
        <button 
          type="button" 
          className="secondary-btn reset-btn" 
          onClick={resetFilters} 
          style={{ padding: '0.8rem 1.2rem', height: '100%' }}
        >
          Reset Filters
        </button>
      </div>
    </section>
  );
};

export default DoctorFilterSidebar;
