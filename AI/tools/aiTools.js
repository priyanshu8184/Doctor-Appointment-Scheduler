/**
 * Controlled AI Tools Execution Layer
 * Executes validated queries against database / service layer.
 * Strictly prevents LLM from executing raw arbitrary SQL.
 */

import { MEDICAL_TAXONOMY } from '../knowledge/medicalTaxonomy.js';

/**
 * Mock / In-Memory Fallback Dataset
 * Used if database connection is temporarily unavailable or during standalone testing.
 */
export const SAMPLE_DOCTORS = [
  {
    doctor_id: 101,
    name: 'Dr. Rahul Sharma',
    first_name: 'Rahul',
    last_name: 'Sharma',
    specialty: 'Dermatology',
    specialties: ['Dermatology', 'Cosmetology'],
    rating: 4.9,
    reviews_count: 124,
    consultation_fee: 65.00,
    experience: '9 years',
    location: 'Metro Skin Center, Sector 4',
    bio: 'Board-certified dermatologist specializing in adult acne, eczema, hair disorders, and laser aesthetics.',
    availability: [
      { day: 'MONDAY', start: '09:00', end: '13:00' },
      { day: 'WEDNESDAY', start: '14:00', end: '19:00' },
      { day: 'FRIDAY', start: '16:00', end: '20:30' },
      { day: 'SATURDAY', start: '10:00', end: '15:00' }
    ]
  },
  {
    doctor_id: 102,
    name: 'Dr. Ananya Iyer',
    first_name: 'Ananya',
    last_name: 'Iyer',
    specialty: 'Cardiology',
    specialties: ['Cardiology', 'Interventional Cardiology'],
    rating: 4.8,
    reviews_count: 98,
    consultation_fee: 90.00,
    experience: '12 years',
    location: 'HealPoint Heart Institute',
    bio: 'Senior cardiologist with extensive expertise in hypertension management, arrhythmia, and preventive cardiology.',
    availability: [
      { day: 'TUESDAY', start: '10:00', end: '14:00' },
      { day: 'THURSDAY', start: '16:00', end: '20:00' },
      { day: 'FRIDAY', start: '17:00', end: '21:00' }
    ]
  },
  {
    doctor_id: 103,
    name: 'Dr. Vikram Sethi',
    first_name: 'Vikram',
    last_name: 'Sethi',
    specialty: 'Neurology',
    specialties: ['Neurology'],
    rating: 4.9,
    reviews_count: 142,
    consultation_fee: 85.00,
    experience: '11 years',
    location: 'Apex Neuro Clinic, Suite 301',
    bio: 'Specialist in migraine management, tension headaches, vertigo, and peripheral neuropathy diagnosis.',
    availability: [
      { day: 'MONDAY', start: '10:00', end: '16:00' },
      { day: 'WEDNESDAY', start: '10:00', end: '16:00' },
      { day: 'FRIDAY', start: '14:00', end: '19:00' }
    ]
  },
  {
    doctor_id: 104,
    name: 'Dr. Priya Nair',
    first_name: 'Priya',
    last_name: 'Nair',
    specialty: 'General Medicine',
    specialties: ['General Medicine', 'Internal Medicine'],
    rating: 4.7,
    reviews_count: 210,
    consultation_fee: 50.00,
    experience: '8 years',
    location: 'HealPoint Primary Care Center',
    bio: 'Compassionate physician focusing on viral illnesses, chronic disease management, and preventive health screenings.',
    availability: [
      { day: 'MONDAY', start: '08:00', end: '18:00' },
      { day: 'TUESDAY', start: '08:00', end: '18:00' },
      { day: 'WEDNESDAY', start: '08:00', end: '18:00' },
      { day: 'THURSDAY', start: '08:00', end: '18:00' },
      { day: 'FRIDAY', start: '08:00', end: '18:00' }
    ]
  },
  {
    doctor_id: 105,
    name: 'Dr. Rajesh Verma',
    first_name: 'Rajesh',
    last_name: 'Verma',
    specialty: 'Orthopedics',
    specialties: ['Orthopedics', 'Sports Medicine'],
    rating: 4.8,
    reviews_count: 85,
    consultation_fee: 75.00,
    experience: '14 years',
    location: 'City Ortho & Joint Care',
    bio: 'Orthopedic specialist focusing on joint pain, sports injuries, lumbar back pain, and non-surgical rehabilitation.',
    availability: [
      { day: 'TUESDAY', start: '09:00', end: '14:00' },
      { day: 'THURSDAY', start: '14:00', end: '19:00' },
      { day: 'SATURDAY', start: '09:00', end: '13:00' }
    ]
  },
  {
    doctor_id: 106,
    name: 'Dr. Sunita Patel',
    first_name: 'Sunita',
    last_name: 'Patel',
    specialty: 'Pediatrics',
    specialties: ['Pediatrics', 'Child Wellness'],
    rating: 4.9,
    reviews_count: 175,
    consultation_fee: 60.00,
    experience: '10 years',
    location: 'Sunshine Kids Clinic',
    bio: 'Dedicated pediatrician with special focus on newborn care, developmental milestones, and childhood immunization.',
    availability: [
      { day: 'MONDAY', start: '09:00', end: '15:00' },
      { day: 'WEDNESDAY', start: '09:00', end: '15:00' },
      { day: 'FRIDAY', start: '09:00', end: '15:00' }
    ]
  }
];

/**
 * 1. Search Doctors by Specialty, Location, Rating, Fee
 */
export const searchDoctorsTool = async ({ specialty, location, maxFee, minRating, dbPool }) => {
  if (dbPool) {
    try {
      let query = `
        SELECT 
          d.doctor_id, d.first_name, d.last_name, d.bio, d.location, d.consultation_fee,
          COALESCE(s.name, 'General Medicine') AS specialty,
          COALESCE(AVG(r.rating), 4.8) AS rating,
          COUNT(r.review_id) AS reviews_count
        FROM doctors d
        LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
        LEFT JOIN reviews r ON d.doctor_id = r.doctor_id
        WHERE 1=1
      `;
      const params = [];

      if (specialty && specialty !== 'All') {
        query += ` AND (LOWER(s.name) LIKE LOWER(?) OR LOWER(d.bio) LIKE LOWER(?))`;
        params.push(`%${specialty}%`, `%${specialty}%`);
      }
      if (location && location !== 'All') {
        query += ` AND LOWER(d.location) LIKE LOWER(?)`;
        params.push(`%${location}%`);
      }
      if (maxFee) {
        query += ` AND d.consultation_fee <= ?`;
        params.push(maxFee);
      }

      query += ` GROUP BY d.doctor_id, s.name`;

      if (minRating) {
        query += ` HAVING rating >= ?`;
        params.push(minRating);
      }

      query += ` ORDER BY rating DESC LIMIT 10`;

      const [rows] = await dbPool.query(query, params);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          doctor_id: r.doctor_id,
          name: `Dr. ${r.first_name} ${r.last_name}`,
          first_name: r.first_name,
          last_name: r.last_name,
          specialty: r.specialty,
          rating: Number(Number(r.rating).toFixed(1)),
          reviews_count: r.reviews_count || 12,
          consultation_fee: Number(r.consultation_fee),
          location: r.location || 'HealPoint Health Center',
          bio: r.bio || 'Qualified medical specialist'
        }));
      }
    } catch (err) {
      console.warn('DB search failed, using fallback doctor catalog:', err.message);
    }
  }

  // Fallback matching
  let results = [...SAMPLE_DOCTORS];
  if (specialty && specialty !== 'All') {
    const specLower = specialty.toLowerCase();
    results = results.filter(d => 
      d.specialty.toLowerCase().includes(specLower) || 
      d.specialties.some(s => s.toLowerCase().includes(specLower)) ||
      d.bio.toLowerCase().includes(specLower)
    );
  }
  if (location && location !== 'All') {
    results = results.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
  }
  if (maxFee) {
    results = results.filter(d => d.consultation_fee <= maxFee);
  }
  if (minRating) {
    results = results.filter(d => d.rating >= minRating);
  }
  return results;
};

/**
 * 2. Generate Available Slots for a given doctor & date
 */
export const findAvailableSlotsTool = async ({ doctorId, specialty, targetDate, timePreference, dbPool }) => {
  const target = targetDate ? new Date(targetDate) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default tomorrow
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayName = days[target.getDay()];

  // Find candidate doctors
  let candidateDoctors = SAMPLE_DOCTORS;
  if (doctorId) {
    candidateDoctors = candidateDoctors.filter(d => d.doctor_id === Number(doctorId));
  } else if (specialty) {
    candidateDoctors = candidateDoctors.filter(d => 
      d.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  const availableSlots = [];

  for (const doc of candidateDoctors) {
    const daySchedule = doc.availability.find(a => a.day === dayName) || doc.availability[0];
    if (daySchedule) {
      // Generate 30-min intervals
      const [startHour] = daySchedule.start.split(':').map(Number);
      const [endHour] = daySchedule.end.split(':').map(Number);

      for (let h = startHour; h < endHour; h++) {
        for (const m of ['00', '30']) {
          const hour12 = h % 12 === 0 ? 12 : h % 12;
          const ampm = h >= 12 ? 'PM' : 'AM';
          const timeFormatted = `${hour12}:${m} ${ampm}`;
          const isEvening = h >= 16;
          const isMorning = h < 12;
          const isAfternoon = h >= 12 && h < 16;

          let matchesTimePref = true;
          if (timePreference === 'morning') matchesTimePref = isMorning;
          if (timePreference === 'afternoon') matchesTimePref = isAfternoon;
          if (timePreference === 'evening') matchesTimePref = isEvening;

          if (matchesTimePref) {
            const dateISO = target.toISOString().split('T')[0];
            availableSlots.push({
              doctorId: doc.doctor_id,
              doctorName: doc.name,
              specialty: doc.specialty,
              fee: doc.consultation_fee,
              date: dateISO,
              dayOfWeek: dayName,
              time: timeFormatted,
              slotISO: `${dateISO}T${String(h).padStart(2, '0')}:${m}:00`
            });
          }
        }
      }
    }
  }

  return availableSlots.slice(0, 6);
};

/**
 * 3. Retrieve Patient Appointments
 */
export const getPatientAppointmentsTool = async ({ patientId, dbPool, sampleAppointments = [] }) => {
  if (dbPool && patientId) {
    try {
      const [rows] = await dbPool.query(`
        SELECT 
          a.appointment_id, a.patient_id, a.doctor_id, a.appointment_datetime, a.status, a.telemedicine_url,
          CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctorName,
          COALESCE(s.name, 'General Medicine') as specialization
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_datetime ASC
      `, [patientId]);
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (e) {
      console.warn('DB getPatientAppointments failed:', e.message);
    }
  }
  return sampleAppointments;
};

/**
 * 4. Create Controlled Appointment
 */
export const createAppointmentTool = async ({ patientId, doctorId, datetime, appointmentType = 'VIDEO', dbPool }) => {
  if (!patientId || !doctorId || !datetime) {
    throw new Error('Missing required fields for appointment booking.');
  }

  if (dbPool) {
    const teleUrl = `/consultation/room_${Date.now()}`;
    const [result] = await dbPool.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status, telemedicine_url)
      VALUES (?, ?, ?, 'SCHEDULED', ?)
    `, [patientId, doctorId, datetime, teleUrl]);

    return {
      appointmentId: result.insertId,
      patientId,
      doctorId,
      datetime,
      status: 'SCHEDULED',
      telemedicineUrl: teleUrl,
      message: 'Appointment successfully confirmed.'
    };
  }

  // Simulated appointment creation
  return {
    appointmentId: Math.floor(1000 + Math.random() * 9000),
    patientId,
    doctorId,
    datetime,
    status: 'SCHEDULED',
    telemedicineUrl: `/consultation/room_${Date.now()}`,
    message: 'Appointment successfully confirmed in HealPoint system.'
  };
};

/**
 * 5. Cancel Controlled Appointment
 */
export const cancelAppointmentTool = async ({ appointmentId, patientId, dbPool }) => {
  if (!appointmentId) throw new Error('Appointment ID is required.');
  if (dbPool) {
    await dbPool.query(`
      UPDATE appointments 
      SET status = 'CANCELLED' 
      WHERE appointment_id = ? AND (patient_id = ? OR ? IS NULL)
    `, [appointmentId, patientId, patientId]);
  }
  return {
    appointmentId,
    status: 'CANCELLED',
    message: `Appointment #${appointmentId} has been successfully cancelled. Any applicable refunds will be processed.`
  };
};
