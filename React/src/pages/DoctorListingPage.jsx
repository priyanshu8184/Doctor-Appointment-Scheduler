import React, { useMemo, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DoctorFilterSidebar from '../components/doctor-listing/DoctorFilterSidebar';
import DoctorCard from '../components/doctor-listing/DoctorCard';
import QuickBookingModal from '../components/doctor-listing/QuickBookingModal';
import './DoctorListingPage.css';
import axios from 'axios';
import { SAMPLE_DOCTORS } from '../../../AI/index.js';

// Authentic clinician portrait mapping with fallback
const DOCTOR_PORTRAITS = {
  101: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=320&q=80',
  102: 'https://images.unsplash.com/photo-1594824813589-9a250325ff2a?auto=format&fit=crop&w=320&q=80',
  103: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&q=80',
  104: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&q=80',
  105: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=320&q=80',
  106: 'https://images.unsplash.com/photo-1594824813589-9a250325ff2a?auto=format&fit=crop&w=320&q=80'
};

const getDoctorPortrait = (doc, idx) => {
  if (doc.profile_picture) return doc.profile_picture;
  if (doc.image) return doc.image;
  const id = doc.id || doc.doctor_id || (101 + (idx % 6));
  return DOCTOR_PORTRAITS[id] || DOCTOR_PORTRAITS[101 + (idx % 6)];
};

const DoctorListingPage = ({ navigate }) => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const queryParams = new URLSearchParams(window.location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialLocation = queryParams.get('location') || 'All';
  const initialAvailability = queryParams.get('availability') || 'All';
  const initialSpecialization = queryParams.get('specialization') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('VIDEO');
  const [bookingStatus, setBookingStatus] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpecialization);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedAvailability, setSelectedAvailability] = useState(initialAvailability);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isDoctor = user?.role === 'DOCTOR';
  
  const [activeFilters, setActiveFilters] = useState({
    search: initialSearch,
    specialization: initialSpecialization,
    location: initialLocation,
    availability: initialAvailability
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (isDoctor) {
      if (navigate) navigate('/doctor-dashboard');
      else window.location.href = '/doctor-dashboard';
    }
  }, [isDoctor, navigate]);

  useEffect(() => {
    if (isDoctor) return;
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/doctors`);
        const docsList = res.data.doctors || res.data || [];
        const listToUse = docsList.length > 0 ? docsList : SAMPLE_DOCTORS;
        const mapped = listToUse.map((doc, idx) => ({
          id: doc.doctor_id || doc.id || (101 + idx),
          name: doc.name || `Dr. ${doc.first_name} ${doc.last_name}`,
          specialization: doc.specialty || doc.specialization || 'General Medicine',
          location: doc.location || 'HealPoint Medical Center',
          availability: typeof doc.availability === 'string' ? doc.availability : 'Today · 4:00 PM',
          experience: doc.experience || '8+ years exp',
          rating: Number(doc.rating || 4.8).toFixed(1),
          reviewsCount: doc.reviews_count || (110 + idx * 12),
          fee: doc.consultation_fee ? `₹${doc.consultation_fee}` : '₹650',
          bio: doc.bio || 'Board-certified specialist dedicated to compassionate, evidence-based patient care.',
          portraitUrl: getDoctorPortrait(doc, idx)
        }));
        setDoctorsList(mapped);
      } catch (err) {
        console.warn("Error loading doctors from API, using registered doctors:", err.message);
        const mapped = (SAMPLE_DOCTORS || []).map((doc, idx) => ({
          id: doc.doctor_id,
          name: doc.name,
          specialization: doc.specialty,
          location: doc.location,
          availability: 'Today · 4:00 PM',
          experience: doc.experience,
          rating: Number(doc.rating).toFixed(1),
          reviewsCount: 120 + idx * 15,
          fee: `₹${doc.consultation_fee}`,
          bio: `Specialized in ${doc.specialty} with comprehensive clinical background.`,
          portraitUrl: getDoctorPortrait(doc, idx)
        }));
        setDoctorsList(mapped);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [isDoctor, API_BASE_URL]);

  const specializations = useMemo(() => {
    const set = new Set(doctorsList.map((doc) => doc.specialization));
    return ['All', ...Array.from(set)];
  }, [doctorsList]);

  const locations = useMemo(() => {
    const set = new Set(doctorsList.map((doc) => doc.location));
    return ['All', ...Array.from(set)];
  }, [doctorsList]);

  const availabilityOptions = useMemo(() => {
    const set = new Set(doctorsList.map((doc) => doc.availability));
    return ['All', ...Array.from(set)];
  }, [doctorsList]);

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const matchSearch = activeFilters.search
        ? doc.name.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
          doc.specialization.toLowerCase().includes(activeFilters.search.toLowerCase())
        : true;
      const matchSpec = activeFilters.specialization === 'All' || doc.specialization === activeFilters.specialization;
      const matchLoc = activeFilters.location === 'All' || doc.location === activeFilters.location;
      const matchAvail = activeFilters.availability === 'All' || doc.availability === activeFilters.availability;
      return matchSearch && matchSpec && matchLoc && matchAvail;
    });
  }, [doctorsList, activeFilters]);

  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [filteredDoctors, currentPage, pageSize]);

  const applyFilters = () => {
    setActiveFilters({
      search: searchTerm,
      specialization: selectedSpecialization,
      location: selectedLocation,
      availability: selectedAvailability
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('All');
    setSelectedLocation('All');
    setSelectedAvailability('All');
    setActiveFilters({
      search: '',
      specialization: 'All',
      location: 'All',
      availability: 'All'
    });
    setCurrentPage(1);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingStatus('Booking...');
    try {
      if (!userStr) {
        setBookingStatus('Please log in as a patient to book.');
        return;
      }
      if (user.role !== 'PATIENT') {
        setBookingStatus('Only patients can book appointments.');
        return;
      }

      const payload = {
        patient_id: user.user_id,
        doctor_id: selectedDoctorForBooking.id,
        appointment_datetime: appointmentDate,
        appointment_type: appointmentType
      };
      
      const res = await axios.post(`${API_BASE_URL}/appointments`, payload);
      if (res.status === 201) {
        setBookingStatus('Appointment booked successfully!');
        setTimeout(() => {
          setSelectedDoctorForBooking(null);
          setBookingStatus('');
          setAppointmentDate('');
        }, 1500);
      } else {
        setBookingStatus('Failed to book appointment.');
      }
    } catch (err) {
      console.error(err);
      setBookingStatus(err.response?.data?.message || 'Failed to book appointment.');
    }
  };

  if (isDoctor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 16 }}>Redirecting to doctor portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-listing-page">
      <Navbar onNavigate={navigate} />

      <main className="doctor-listing-shell">
        <section className="doctor-listing-header">
          <div>
            <p className="eyebrow">Find the right care</p>
            <h1>Browse available doctors</h1>
            <p className="doctor-listing-text">Search by specialty, location, and availability to book your next appointment quickly.</p>
          </div>
        </section>

        <DoctorFilterSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSpecialization={selectedSpecialization}
          setSelectedSpecialization={setSelectedSpecialization}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedAvailability={selectedAvailability}
          setSelectedAvailability={setSelectedAvailability}
          specializations={specializations}
          locations={locations}
          availabilityOptions={availabilityOptions}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
        />

        <section className="doctor-cards" aria-label="Doctor cards">
          {loading ? (
            <div className="empty-state">
              <h2>Loading doctors...</h2>
              <p>Please wait while we fetch the doctor directory.</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h2>Error</h2>
              <p>{error}</p>
            </div>
          ) : paginatedDoctors.length > 0 ? (
            paginatedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                isImageFailed={failedImages[doctor.id]}
                onImageError={() => setFailedImages(prev => ({ ...prev, [doctor.id]: true }))}
                onBookClick={(doc) => setSelectedDoctorForBooking(doc)}
              />
            ))
          ) : (
            <div className="empty-state">
              <h2>No doctors found</h2>
              <p>Try adjusting your search criteria or filters to find available healthcare providers.</p>
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <div className="pagination" aria-label="Pagination Navigation">
            <button
              type="button"
              className="secondary-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              className="secondary-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />

      {/* Quick Booking Modal */}
      <QuickBookingModal
        doctor={selectedDoctorForBooking}
        onClose={() => setSelectedDoctorForBooking(null)}
        appointmentDate={appointmentDate}
        setAppointmentDate={setAppointmentDate}
        appointmentType={appointmentType}
        setAppointmentType={setAppointmentType}
        bookingStatus={bookingStatus}
        handleBookAppointment={handleBookAppointment}
      />
    </div>
  );
};

export default DoctorListingPage;
