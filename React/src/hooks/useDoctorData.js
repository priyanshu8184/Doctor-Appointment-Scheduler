import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const useDoctorData = (navigate) => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allDoctorAppointments, setAllDoctorAppointments] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';

  const getAuthHeaders = useCallback(() => {
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      user = null;
    }
    const token = localStorage.getItem('token') || (user && user.token);
    return {
      'x-user-id': user?.user_id || 101,
      'x-user-role': user?.role || 'DOCTOR',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    let loggedInUser = null;
    try {
      const userStr = localStorage.getItem('user');
      loggedInUser = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      loggedInUser = null;
    }

    if (!loggedInUser || loggedInUser.role !== 'DOCTOR') {
      if (navigate) {
        navigate(loggedInUser ? '/patient-dashboard' : '/login');
      } else {
        window.location.href = loggedInUser ? '/patient-dashboard' : '/login';
      }
      return;
    }

    const doctorId = loggedInUser.user_id || loggedInUser.doctor_id || 101;

    // Default fallback doctor profile data
    const doctorFirstName = loggedInUser.first_name || (loggedInUser.name ? loggedInUser.name.split(' ')[0] : 'Rahul');
    const doctorLastName = loggedInUser.last_name || (loggedInUser.name ? loggedInUser.name.split(' ').slice(1).join(' ') : 'Sharma');
    const displayName = `Dr. ${doctorFirstName.replace(/^dr\.?\s*/i, '')} ${doctorLastName || ''}`.trim();

    const fallbackProfile = {
      id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      name: displayName,
      specialization: loggedInUser.specialization || loggedInUser.specialty || 'General Medicine & Dermatology',
      experience: loggedInUser.experience_years ? `${loggedInUser.experience_years} years` : (loggedInUser.experience || '10+ years'),
      education: loggedInUser.qualifications || loggedInUser.education || 'MBBS, MD',
      clinic: loggedInUser.location || 'HealPoint Clinical Center, Room 302',
      phone: loggedInUser.phone_number || '+1 (555) 019-3482',
      email: loggedInUser.email || 'doctor@healpoint.com',
      consultation_fee: loggedInUser.consultation_fee || 65,
      bio: loggedInUser.bio || 'Board-certified medical specialist dedicated to patient wellness and evidence-based clinical care.',
      profilePicture: loggedInUser.profile_picture || null,
      certificate: loggedInUser.certificate || null
    };

    const fallbackAppointments = [
      {
        id: 101,
        patient_id: 1,
        patientName: 'Alex Morgan',
        patientEmail: 'alex.morgan@example.com',
        type: 'VIDEO',
        date: new Date().toISOString(),
        time: '10:30 AM',
        status: 'SCHEDULED'
      },
      {
        id: 102,
        patient_id: 2,
        patientName: 'Sarah Jenkins',
        patientEmail: 'sarah.j@example.com',
        type: 'IN_PERSON',
        date: new Date().toISOString(),
        time: '02:00 PM',
        status: 'ACCEPTED'
      },
      {
        id: 103,
        patient_id: 3,
        patientName: 'Michael Chen',
        patientEmail: 'mchen@example.com',
        type: 'VIDEO',
        date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        time: '11:15 AM',
        status: 'ACCEPTED'
      },
      {
        id: 104,
        patient_id: 4,
        patientName: 'Emily Davis',
        patientEmail: 'emily.d@example.com',
        type: 'IN_PERSON',
        date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        time: '03:45 PM',
        status: 'SCHEDULED'
      },
      {
        id: 105,
        patient_id: 1,
        patientName: 'Alex Morgan',
        patientEmail: 'alex.morgan@example.com',
        type: 'VIDEO',
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        time: '09:00 AM',
        status: 'COMPLETED'
      }
    ];

    const fallbackAvailability = [
      { id: 1, day: 'Every MONDAY', day_of_week: 'MONDAY', slots: '09:00 - 17:00', start_time: '09:00', end_time: '17:00', is_available: true },
      { id: 2, day: 'Every WEDNESDAY', day_of_week: 'WEDNESDAY', slots: '09:00 - 17:00', start_time: '09:00', end_time: '17:00', is_available: true },
      { id: 3, day: 'Every FRIDAY', day_of_week: 'FRIDAY', slots: '10:00 - 16:00', start_time: '10:00', end_time: '16:00', is_available: true },
      { id: 4, day: 'Every SATURDAY', day_of_week: 'SATURDAY', slots: 'Unavailable (Blocked)', start_time: null, end_time: null, is_available: false }
    ];

    // Set fallback initial states immediately
    setProfileData(fallbackProfile);
    setAllDoctorAppointments(fallbackAppointments);
    const todayStr = new Date().toDateString();
    setTodayAppointments(fallbackAppointments.filter(apt => new Date(apt.date).toDateString() === todayStr));
    setUpcomingAppointments(fallbackAppointments.filter(apt => new Date(apt.date).toDateString() !== todayStr));
    setAvailabilitySlots(fallbackAvailability);
    setLoading(false);

    try {
      const headers = getAuthHeaders();

      // 1. Fetch Doctor Profile
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`, { headers });
        const dbDoctor = profileRes.data.doctor || {};
        if (dbDoctor && (dbDoctor.first_name || dbDoctor.name)) {
          const fn = dbDoctor.first_name || (dbDoctor.name ? dbDoctor.name.split(' ')[0] : doctorFirstName);
          const ln = dbDoctor.last_name || (dbDoctor.name ? dbDoctor.name.split(' ').slice(1).join(' ') : doctorLastName);
          setProfileData({
            id: doctorId,
            first_name: fn,
            last_name: ln,
            name: dbDoctor.name || `Dr. ${fn} ${ln}`.trim(),
            specialization: dbDoctor.specialization || dbDoctor.specialty || fallbackProfile.specialization,
            experience: dbDoctor.experience || (dbDoctor.experience_years ? `${dbDoctor.experience_years} years` : fallbackProfile.experience),
            education: dbDoctor.education || dbDoctor.qualifications || fallbackProfile.education,
            clinic: dbDoctor.location || fallbackProfile.clinic,
            phone: dbDoctor.phone_number || fallbackProfile.phone,
            email: dbDoctor.email || loggedInUser.email,
            consultation_fee: dbDoctor.consultation_fee || fallbackProfile.consultation_fee,
            bio: dbDoctor.bio || fallbackProfile.bio,
            profilePicture: dbDoctor.profile_picture ? (dbDoctor.profile_picture.startsWith('http') ? dbDoctor.profile_picture : `${API_BASE_URL.replace('/api', '')}${dbDoctor.profile_picture}`) : null,
            certificate: dbDoctor.certificate ? (dbDoctor.certificate.startsWith('http') ? dbDoctor.certificate : `${API_BASE_URL.replace('/api', '')}${dbDoctor.certificate}`) : null
          });
        }
      } catch (err) {
        console.warn('Doctor profile API note:', err.message);
      }

      // 2. Fetch Doctor Appointments
      try {
        const appointmentsRes = await axios.get(`${API_BASE_URL}/appointments`, { headers });
        const allAppointments = appointmentsRes.data.appointments || [];
        
        const myApts = allAppointments
          .filter(a => a.doctor_id === doctorId || a.doctor_name?.toLowerCase().includes(doctorFirstName.toLowerCase()))
          .map(apt => ({
            id: apt.appointment_id || apt.id,
            patient_id: apt.patient_id || 1,
            patientName: apt.patient_name || `Patient #${apt.patient_id}`,
            patientEmail: apt.patient_email || 'patient@healpoint.com',
            type: apt.appointment_type || 'VIDEO',
            date: apt.appointment_datetime || new Date().toISOString(),
            time: apt.appointment_datetime ? new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
            status: apt.status || 'SCHEDULED',
            cancellation_reason: apt.cancellation_reason || null,
            telemedicine_url: apt.telemedicine_url || null
          }));

        if (myApts.length > 0) {
          setAllDoctorAppointments(myApts);
          const currentToday = new Date().toDateString();
          setTodayAppointments(myApts.filter(apt => new Date(apt.date).toDateString() === currentToday));
          setUpcomingAppointments(myApts.filter(apt => new Date(apt.date).toDateString() !== currentToday));
        }
      } catch (err) {
        console.warn('Doctor appointments API note:', err.message);
      }

      // 3. Fetch Doctor Availability
      try {
        const availabilityRes = await axios.get(`${API_BASE_URL}/doctor-availability/doctor/${doctorId}`, { headers });
        const availabilityArray = availabilityRes.data.availability || [];
        if (availabilityArray.length > 0) {
          setAvailabilitySlots(availabilityArray.map(slot => ({
            id: slot.availability_id,
            day: slot.specific_date ? `Date: ${slot.specific_date}` : `Every ${slot.day_of_week}`,
            day_of_week: slot.day_of_week,
            specific_date: slot.specific_date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            slots: slot.is_available ? `${slot.start_time} - ${slot.end_time}` : 'Unavailable (Blocked)',
            is_available: slot.is_available
          })));
        }
      } catch (err) {
        console.warn('Doctor availability API note:', err.message);
      }

    } catch (err) {
      console.warn('Dashboard data fetch finished with fallback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthHeaders, navigate]);

  // Derived 4 Stat Card Metrics
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    // 1. Today's appointments count
    const todayCount = allDoctorAppointments.filter(a => new Date(a.date).toDateString() === today).length;

    // 2. Pending requests count (Awaiting doctor action)
    const pendingCount = allDoctorAppointments.filter(a => a.status === 'PENDING' || a.status === 'SCHEDULED').length;

    // 3. Upcoming Confirmed Consultations (Accepted / Confirmed in future)
    const upcomingConfirmedCount = allDoctorAppointments.filter(a => {
      const isFuture = new Date(a.date) >= new Date(new Date().setHours(0,0,0,0));
      return (a.status === 'ACCEPTED' || a.status === 'CONFIRMED') && isFuture;
    }).length;

    // 4. Completed appointments
    const completedCount = allDoctorAppointments.filter(a => a.status === 'COMPLETED').length;

    return {
      todayCount,
      pendingCount,
      upcomingConfirmedCount,
      completedCount
    };
  }, [allDoctorAppointments]);

  // Derived Distinct Patients Roster
  const patients = useMemo(() => {
    const patientMap = new Map();

    allDoctorAppointments.forEach(apt => {
      const pId = apt.patient_id || apt.patientName;
      if (!patientMap.has(pId)) {
        patientMap.set(pId, {
          id: pId,
          name: apt.patientName,
          email: apt.patientEmail || 'patient@healpoint.com',
          visits: 1,
          lastVisit: apt.date,
          history: [apt]
        });
      } else {
        const existing = patientMap.get(pId);
        existing.visits += 1;
        existing.history.push(apt);
        if (new Date(apt.date) > new Date(existing.lastVisit)) {
          existing.lastVisit = apt.date;
        }
      }
    });

    return Array.from(patientMap.values());
  }, [allDoctorAppointments]);

  // Handle appointment status transition with optional cancellation/rejection reason
  const handleUpdateAppointmentStatus = async (appointmentId, status, cancellation_reason = null) => {
    try {
      const headers = getAuthHeaders();
      await axios.patch(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        { status, cancellation_reason },
        { headers }
      );

      const updater = apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            status,
            ...(cancellation_reason ? { cancellation_reason } : {})
          };
        }
        return apt;
      };

      setAllDoctorAppointments(prev => prev.map(updater));
      setTodayAppointments(prev => prev.map(updater));
      setUpcomingAppointments(prev => prev.map(updater));
    } catch (err) {
      alert("Failed to update appointment status: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle Profile Update and sync with localStorage
  const handleSaveProfile = async (profileForm, profilePictureFile, certificateFile) => {
    try {
      const headers = getAuthHeaders();
      const userStr = localStorage.getItem('user');
      const loggedInUser = userStr ? JSON.parse(userStr) : {};
      const doctorId = loggedInUser.user_id || loggedInUser.doctor_id || 101;

      const payload = new FormData();
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key] !== undefined && profileForm[key] !== null) {
          payload.append(key, profileForm[key]);
        }
      });
      if (profilePictureFile) payload.append('profile_picture', profilePictureFile);
      if (certificateFile) payload.append('certificate', certificateFile);

      const res = await axios.put(`${API_BASE_URL}/doctors/${doctorId}`, payload, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local storage user object so Navbar and dashboard stay perfectly in sync
      const updatedUser = {
        ...loggedInUser,
        first_name: profileForm.first_name || loggedInUser.first_name,
        last_name: profileForm.last_name || loggedInUser.last_name,
        specialization: profileForm.specialization || loggedInUser.specialization,
        phone_number: profileForm.phone_number || loggedInUser.phone_number,
        location: profileForm.location || loggedInUser.location,
        bio: profileForm.bio || loggedInUser.bio,
        consultation_fee: profileForm.consultation_fee || loggedInUser.consultation_fee
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert("Clinical Profile updated successfully!");
      fetchDashboardData();
      return true;
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
      return false;
    }
  };

  // Add Availability rule
  const handleAddAvailability = async (formData) => {
    try {
      const headers = getAuthHeaders();
      const userStr = localStorage.getItem('user');
      const loggedInUser = userStr ? JSON.parse(userStr) : {};
      const doctorId = loggedInUser.user_id || loggedInUser.doctor_id || 101;

      const payload = {
        doctor_id: doctorId,
        is_available: formData.availFormStatus === 'AVAILABLE'
      };

      if (formData.availFormType === 'RECURRING') {
        payload.day_of_week = formData.availFormDay;
      } else {
        payload.specific_date = formData.availFormDate;
      }

      if (payload.is_available) {
        payload.start_time = formData.availFormStart;
        payload.end_time = formData.availFormEnd;
      }

      await axios.post(`${API_BASE_URL}/doctor-availability`, payload, { headers });
      alert("Availability rule created successfully!");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to add availability: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete Availability rule
  const handleDeleteAvailability = async (id) => {
    if (!window.confirm("Are you sure you want to remove this availability rule?")) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/doctor-availability/${id}`, { headers });
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));
    } catch (err) {
      alert("Failed to delete availability: " + (err.response?.data?.message || err.message));
    }
  };

  return {
    todayAppointments,
    upcomingAppointments,
    allDoctorAppointments,
    availabilitySlots,
    patients,
    profileData,
    stats,
    loading,
    error,
    API_BASE_URL,
    fetchDashboardData,
    handleUpdateAppointmentStatus,
    handleSaveProfile,
    handleAddAvailability,
    handleDeleteAvailability
  };
};
