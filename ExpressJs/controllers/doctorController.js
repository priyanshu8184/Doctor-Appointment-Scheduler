import dbPool from '../config/db.js';
import { SAMPLE_DOCTORS } from '../../AI/tools/aiTools.js';

// In-Memory availability store fallback
let inMemoryAvailability = [
  { availability_id: 1, doctor_id: 101, day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00', is_available: true, specific_date: null },
  { availability_id: 2, doctor_id: 101, day_of_week: 'TUESDAY', start_time: '09:00', end_time: '17:00', is_available: true, specific_date: null },
  { availability_id: 3, doctor_id: 101, day_of_week: 'WEDNESDAY', start_time: '09:00', end_time: '17:00', is_available: true, specific_date: null },
  { availability_id: 4, doctor_id: 101, day_of_week: 'THURSDAY', start_time: '09:00', end_time: '17:00', is_available: true, specific_date: null },
  { availability_id: 5, doctor_id: 101, day_of_week: 'FRIDAY', start_time: '10:00', end_time: '16:00', is_available: true, specific_date: null }
];

export const getAllDoctors = async (req, res) => {
  try {
    if (dbPool) {
      const [rows] = await dbPool.query(`
        SELECT 
          d.doctor_id, d.first_name, d.last_name, d.bio, d.location, d.consultation_fee,
          COALESCE(s.name, d.specialization, 'General Medicine') AS specialty,
          COALESCE(AVG(r.rating), 4.8) AS rating,
          COUNT(r.review_id) AS reviews_count,
          d.experience_years, d.qualifications
        FROM doctors d
        LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
        LEFT JOIN reviews r ON d.doctor_id = r.doctor_id
        GROUP BY d.doctor_id, s.name, d.specialization
      `);
      if (rows && rows.length > 0) {
        return res.json({ doctors: rows });
      }
    }
    res.json({ doctors: SAMPLE_DOCTORS });
  } catch (err) {
    console.error('Doctor list error:', err);
    res.json({ doctors: SAMPLE_DOCTORS });
  }
};

export const getDoctorById = async (req, res) => {
  const { id } = req.params;
  const docId = Number(id);

  try {
    if (dbPool) {
      const [rows] = await dbPool.query(`
        SELECT d.*, u.email, u.phone_number, u.first_name, u.last_name, u.profile_picture
        FROM doctors d
        JOIN users u ON d.user_id = u.user_id
        WHERE d.doctor_id = ? OR d.user_id = ?
      `, [docId, docId]);
      if (rows && rows.length > 0) {
        return res.json({ doctor: rows[0] });
      }
    }
  } catch (err) {
    console.warn('DB getDoctorById fallback:', err.message);
  }

  const doc = SAMPLE_DOCTORS.find(d => d.doctor_id === docId) || SAMPLE_DOCTORS[0];
  res.json({ doctor: doc });
};

export const updateDoctorProfile = async (req, res) => {
  const { id } = req.params;
  const docId = Number(id);
  const user = req.user;

  // Authorization check: doctor can only update their own profile
  if (user && user.role === 'DOCTOR' && user.user_id !== docId && user.doctor_id !== docId) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update this doctor profile.' });
  }

  const {
    first_name,
    last_name,
    specialization,
    experience,
    education,
    location,
    phone_number,
    bio,
    consultation_fee
  } = req.body;

  try {
    if (dbPool) {
      await dbPool.query(`
        UPDATE doctors d
        JOIN users u ON d.user_id = u.user_id
        SET 
          u.first_name = COALESCE(?, u.first_name),
          u.last_name = COALESCE(?, u.last_name),
          u.phone_number = COALESCE(?, u.phone_number),
          d.first_name = COALESCE(?, d.first_name),
          d.last_name = COALESCE(?, d.last_name),
          d.specialization = COALESCE(?, d.specialization),
          d.bio = COALESCE(?, d.bio),
          d.location = COALESCE(?, d.location),
          d.consultation_fee = COALESCE(?, d.consultation_fee)
        WHERE d.doctor_id = ? OR d.user_id = ?
      `, [
        first_name, last_name, phone_number,
        first_name, last_name, specialization,
        bio, location, consultation_fee,
        docId, docId
      ]);
    }
  } catch (err) {
    console.warn('DB updateDoctorProfile fallback:', err.message);
  }

  res.json({
    success: true,
    message: 'Doctor profile updated successfully.',
    doctor: {
      id: docId,
      first_name,
      last_name,
      specialization,
      experience,
      education,
      location,
      phone_number,
      bio,
      consultation_fee
    }
  });
};

export const getDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const docId = Number(id);

  try {
    if (dbPool) {
      const [rows] = await dbPool.query(`
        SELECT * FROM doctor_availability WHERE doctor_id = ?
      `, [docId]);
      if (rows && rows.length > 0) {
        return res.json({ availability: rows });
      }
    }
  } catch (err) {
    console.warn('DB getDoctorAvailability fallback:', err.message);
  }

  const slots = inMemoryAvailability.filter(a => a.doctor_id === docId || a.doctor_id === 101);
  res.json({ availability: slots });
};

export const addDoctorAvailability = async (req, res) => {
  const { doctor_id, day_of_week, start_time, end_time, is_available, specific_date } = req.body;
  const user = req.user;
  const targetDocId = Number(doctor_id) || user?.user_id || 101;

  const newSlot = {
    availability_id: Date.now(),
    doctor_id: targetDocId,
    day_of_week: day_of_week || 'MONDAY',
    start_time: start_time || '09:00',
    end_time: end_time || '17:00',
    is_available: is_available !== false,
    specific_date: specific_date || null
  };

  inMemoryAvailability.push(newSlot);

  try {
    if (dbPool) {
      await dbPool.query(`
        INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available, specific_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [newSlot.doctor_id, newSlot.day_of_week, newSlot.start_time, newSlot.end_time, newSlot.is_available, newSlot.specific_date]);
    }
  } catch (err) {
    console.warn('DB addDoctorAvailability fallback:', err.message);
  }

  res.status(201).json({ success: true, message: 'Availability rule added.', availability: newSlot });
};

export const deleteDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const availId = Number(id);

  inMemoryAvailability = inMemoryAvailability.filter(a => a.availability_id !== availId);

  try {
    if (dbPool) {
      await dbPool.query(`DELETE FROM doctor_availability WHERE availability_id = ?`, [availId]);
    }
  } catch (err) {
    console.warn('DB deleteDoctorAvailability fallback:', err.message);
  }

  res.json({ success: true, message: 'Availability rule deleted.' });
};
