/**
 * Doctor Recommendation & Personalization Service
 * Recommends doctors based on patient history, preferred specialties, top ratings, and slot availability.
 */

import { searchDoctorsTool, SAMPLE_DOCTORS } from '../tools/aiTools.js';

export const getPersonalizedRecommendations = async ({ patientId, dbPool }) => {
  // If patient has past appointments, inspect most frequently visited specialty
  let preferredSpecialty = null;
  if (dbPool && patientId) {
    try {
      const [rows] = await dbPool.query(`
        SELECT s.name AS specialty, COUNT(a.appointment_id) AS visit_count
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.doctor_id
        JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        JOIN specialties s ON ds.specialty_id = s.specialty_id
        WHERE a.patient_id = ?
        GROUP BY s.name
        ORDER BY visit_count DESC
        LIMIT 1
      `, [patientId]);
      if (rows && rows.length > 0) {
        preferredSpecialty = rows[0].specialty;
      }
    } catch (e) {
      console.warn('DB personalization query skipped:', e.message);
    }
  }

  const specialtyToQuery = preferredSpecialty || 'Dermatology';
  const doctors = await searchDoctorsTool({ specialty: specialtyToQuery, dbPool });

  return {
    headline: preferredSpecialty 
      ? `Recommended for you (Based on your previous ${preferredSpecialty} visits)`
      : 'Top-Rated Healthcare Specialists Recommended for You',
    specialty: specialtyToQuery,
    doctors: doctors.length > 0 ? doctors.slice(0, 3) : SAMPLE_DOCTORS.slice(0, 3)
  };
};
