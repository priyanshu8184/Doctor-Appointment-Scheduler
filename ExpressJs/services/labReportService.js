import fs from 'fs';
import path from 'path';
import { 
  analyzeLabReport, 
  SAMPLE_LAB_REPORTS,
  searchDoctorsTool, 
  SAMPLE_DOCTORS
} from '../../AI/index.js';
import dbPool from '../config/db.js';

// In-Memory fallback store for lab reports
export let inMemoryLabReports = [
  {
    id: 1,
    patient_id: 1,
    file_name: 'CBC_Metabolic_Report_Oct2026.pdf',
    file_path: '/uploads/lab-reports/sample_cbc_1.pdf',
    file_type: 'application/pdf',
    report_type: 'Complete Blood Count & Metabolic Profile',
    analysis_status: 'COMPLETED',
    analysis_result: analyzeLabReport(SAMPLE_LAB_REPORTS[0].text),
    recommended_specialty: 'General Medicine',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    patient_id: 1,
    file_name: 'Thyroid_Panel_Oct2026.pdf',
    file_path: '/uploads/lab-reports/sample_thyroid_1.pdf',
    file_type: 'application/pdf',
    report_type: 'Thyroid Function Panel',
    analysis_status: 'COMPLETED',
    analysis_result: analyzeLabReport(SAMPLE_LAB_REPORTS[2].text),
    recommended_specialty: 'General Medicine',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export let nextReportId = 100;

export const setNextReportId = (id) => {
  nextReportId = id;
};

/**
 * Extract text from PDF or text buffer
 */
export const extractTextFromFile = async (file) => {
  if (!file) return '';

  const ext = path.extname(file.originalname || file.filename || '').toLowerCase();
  
  // Try PDF parsing
  if (ext === '.pdf' || file.mimetype === 'application/pdf') {
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
        return pdfData.text;
      }
    } catch (pdfErr) {
      console.warn('PDF parsing error fallback:', pdfErr.message);
    }
  }

  // Fallback / plain text reading or binary string search
  try {
    const rawBuffer = fs.readFileSync(file.path);
    const utf8Str = rawBuffer.toString('utf8');
    const printable = utf8Str.replace(/[^\x20-\x7E\r\n\t]/g, ' ');
    if (printable.length > 30 && (printable.includes('Hemoglobin') || printable.includes('Glucose') || printable.includes('Cholesterol') || printable.includes('Result'))) {
      return printable;
    }
  } catch (err) {
    console.warn('Fallback file read warning:', err.message);
  }

  return '';
};

/**
 * Fetch and rank doctor recommendations for the analyzed report
 */
export const getMatchingDoctorsForReport = async (analysisResult) => {
  const primarySpec = analysisResult.primarySpecialty || 'General Medicine';
  const allRecommendedSpecs = (analysisResult.recommendedSpecialties || []).map(s => s.specialty);
  if (!allRecommendedSpecs.includes('General Medicine')) {
    allRecommendedSpecs.push('General Medicine');
  }

  const matchedDoctors = [];
  const seenDoctorIds = new Set();

  try {
    const [rows] = await dbPool.query(`
      SELECT 
        d.doctor_id,
        u.first_name,
        u.last_name,
        d.specialization,
        d.location,
        d.consultation_fee,
        d.rating,
        d.reviews_count,
        d.experience_years,
        d.qualifications,
        d.bio,
        u.profile_picture
      FROM doctors d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.approval_status = 'APPROVED'
      ORDER BY d.rating DESC, d.experience_years DESC
    `);

    if (rows && rows.length > 0) {
      // Priority 1: Match primary specialty
      for (const doc of rows) {
        if (doc.specialization?.toLowerCase() === primarySpec.toLowerCase()) {
          matchedDoctors.push({
            doctor_id: doc.doctor_id,
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialization: doc.specialization,
            location: doc.location || 'HealPoint Clinic',
            consultation_fee: doc.consultation_fee || 65.00,
            rating: Number(doc.rating || 4.8),
            experience: `${doc.experience_years || 8}+ years`,
            match_reason: `Primary recommendation for ${primarySpec}`,
            is_primary_match: true
          });
          seenDoctorIds.add(doc.doctor_id);
        }
      }

      // Priority 2: Other recommended specialties
      for (const doc of rows) {
        if (!seenDoctorIds.has(doc.doctor_id) && allRecommendedSpecs.some(s => s.toLowerCase() === doc.specialization?.toLowerCase())) {
          matchedDoctors.push({
            doctor_id: doc.doctor_id,
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialization: doc.specialization,
            location: doc.location || 'HealPoint Clinic',
            consultation_fee: doc.consultation_fee || 65.00,
            rating: Number(doc.rating || 4.7),
            experience: `${doc.experience_years || 6}+ years`,
            match_reason: `Recommended specialist for ${doc.specialization}`,
            is_primary_match: false
          });
          seenDoctorIds.add(doc.doctor_id);
        }
      }
    }
  } catch (dbErr) {
    console.warn('DB Doctor matching query error, falling back to AI SAMPLE_DOCTORS:', dbErr.message);
  }

  // Fallback to SAMPLE_DOCTORS
  if (matchedDoctors.length === 0 && SAMPLE_DOCTORS) {
    for (const doc of SAMPLE_DOCTORS) {
      const isPrimary = doc.specialty?.toLowerCase() === primarySpec.toLowerCase();
      const isSecondary = allRecommendedSpecs.some(s => s.toLowerCase() === doc.specialty?.toLowerCase());
      
      if (isPrimary || isSecondary) {
        matchedDoctors.push({
          doctor_id: doc.doctor_id,
          name: doc.name,
          specialization: doc.specialty,
          location: doc.location,
          consultation_fee: doc.consultation_fee,
          rating: doc.rating,
          experience: doc.experience,
          match_reason: isPrimary ? `Primary recommendation for ${primarySpec}` : `Specialist for ${doc.specialty}`,
          is_primary_match: isPrimary
        });
      }
    }
  }

  return matchedDoctors;
};
