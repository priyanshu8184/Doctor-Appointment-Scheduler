import dbPool from '../config/db.js';
import { SAMPLE_DOCTORS } from '../../AI/tools/aiTools.js';

export const getAllDoctors = async (req, res) => {
  try {
    if (dbPool) {
      const [rows] = await dbPool.query(`
        SELECT 
          d.doctor_id, d.first_name, d.last_name, d.bio, d.location, d.consultation_fee,
          COALESCE(s.name, 'General Medicine') AS specialty,
          COALESCE(AVG(r.rating), 4.8) AS rating,
          COUNT(r.review_id) AS reviews_count
        FROM doctors d
        LEFT JOIN doctor_specialties ds ON d.doctor_id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
        LEFT JOIN reviews r ON d.doctor_id = r.doctor_id
        GROUP BY d.doctor_id, s.name
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
  const doc = SAMPLE_DOCTORS.find(d => d.doctor_id === Number(id)) || SAMPLE_DOCTORS[0];
  res.json({ doctor: doc });
};
