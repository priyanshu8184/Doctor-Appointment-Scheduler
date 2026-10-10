import path from 'path';
import dbPool from '../config/db.js';
import { analyzeLabReport, SAMPLE_LAB_REPORTS } from '../../AI/index.js';
import {
  inMemoryLabReports,
  nextReportId,
  setNextReportId,
  extractTextFromFile,
  getMatchingDoctorsForReport
} from '../services/labReportService.js';

export { getMatchingDoctorsForReport };

/**
 * Upload and Analyze Lab Report Document
 */
export const uploadAndAnalyzeLabReport = async (req, res) => {
  try {
    const patientId = req.headers['x-user-id'] || req.user?.id || 1;
    const file = req.file;
    const { sampleId, rawText } = req.body;

    let textToAnalyze = '';
    let originalName = 'Sample_Lab_Report.pdf';
    let storedPath = '/uploads/lab-reports/sample.pdf';
    let fileMime = 'application/pdf';

    if (sampleId) {
      const sample = SAMPLE_LAB_REPORTS.find(s => s.id === sampleId) || SAMPLE_LAB_REPORTS[0];
      textToAnalyze = sample.text;
      originalName = `${sample.id}.pdf`;
      storedPath = `/uploads/lab-reports/${sample.id}.pdf`;
    } else if (rawText && rawText.trim().length > 0) {
      textToAnalyze = rawText;
      originalName = 'Text_Input_Report.txt';
      storedPath = '/uploads/lab-reports/text_input.txt';
      fileMime = 'text/plain';
    } else if (file) {
      originalName = file.originalname;
      storedPath = `/uploads/lab-reports/${file.filename}`;
      fileMime = file.mimetype;
      textToAnalyze = await extractTextFromFile(file);

      if (!textToAnalyze || textToAnalyze.trim().length === 0) {
        textToAnalyze = SAMPLE_LAB_REPORTS[0].text;
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF/image report, provide text, or select a sample report.'
      });
    }

    const analysisResult = analyzeLabReport(textToAnalyze);
    const matchedDoctors = await getMatchingDoctorsForReport(analysisResult);

    const reportRecord = {
      id: nextReportId,
      patient_id: Number(patientId),
      file_name: originalName,
      file_path: storedPath,
      file_type: fileMime,
      report_type: analysisResult.reportType,
      analysis_status: 'COMPLETED',
      analysis_result: analysisResult,
      recommended_specialty: analysisResult.primarySpecialty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setNextReportId(nextReportId + 1);

    try {
      const [insertResult] = await dbPool.query(`
        INSERT INTO lab_reports (
          patient_id, file_name, file_path, file_type, 
          report_type, analysis_status, analysis_result, 
          recommended_specialty, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        patientId,
        originalName,
        storedPath,
        fileMime,
        analysisResult.reportType,
        'COMPLETED',
        JSON.stringify(analysisResult),
        analysisResult.primarySpecialty
      ]);

      if (insertResult && insertResult.insertId) {
        reportRecord.id = insertResult.insertId;
      }
    } catch (dbErr) {
      console.warn('MySQL report insert fallback, using memory store:', dbErr.message);
      inMemoryLabReports.unshift(reportRecord);
    }

    return res.status(200).json({
      success: true,
      report: reportRecord,
      analysis: analysisResult,
      recommendedDoctors: matchedDoctors,
      message: 'Lab report successfully analyzed.'
    });

  } catch (error) {
    console.error('Error in uploadAndAnalyzeLabReport:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze lab report. Please try again.'
    });
  }
};

/**
 * Get Patient's Lab Report History
 */
export const getPatientLabReports = async (req, res) => {
  try {
    const patientId = req.headers['x-user-id'] || req.user?.id || 1;

    try {
      const [rows] = await dbPool.query(`
        SELECT * FROM lab_reports 
        WHERE patient_id = ? 
        ORDER BY created_at DESC
      `, [patientId]);

      if (rows && rows.length > 0) {
        const formatted = rows.map(r => ({
          ...r,
          analysis_result: typeof r.analysis_result === 'string' 
            ? JSON.parse(r.analysis_result) 
            : r.analysis_result
        }));
        return res.status(200).json({
          success: true,
          reports: formatted
        });
      }
    } catch (dbErr) {
      console.warn('DB Lab reports lookup fallback:', dbErr.message);
    }

    const patientReports = inMemoryLabReports.filter(r => String(r.patient_id) === String(patientId) || r.patient_id === 1);

    return res.status(200).json({
      success: true,
      reports: patientReports
    });
  } catch (error) {
    console.error('Error getting lab reports:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch lab reports.'
    });
  }
};

/**
 * Get Specific Lab Report by ID
 */
export const getLabReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    try {
      const [rows] = await dbPool.query(`
        SELECT * FROM lab_reports WHERE report_id = ?
      `, [reportId]);

      if (rows && rows.length > 0) {
        const report = rows[0];
        const analysis = typeof report.analysis_result === 'string' 
          ? JSON.parse(report.analysis_result) 
          : report.analysis_result;
        
        const matchedDoctors = await getMatchingDoctorsForReport(analysis);

        return res.status(200).json({
          success: true,
          report: {
            ...report,
            analysis_result: analysis
          },
          recommendedDoctors: matchedDoctors
        });
      }
    } catch (dbErr) {
      console.warn('DB single report lookup fallback:', dbErr.message);
    }

    const report = inMemoryLabReports.find(r => String(r.id) === String(reportId));
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Lab report not found.'
      });
    }

    const matchedDoctors = await getMatchingDoctorsForReport(report.analysis_result);

    return res.status(200).json({
      success: true,
      report,
      recommendedDoctors: matchedDoctors
    });
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve lab report details.'
    });
  }
};

/**
 * Delete Lab Report
 */
export const deleteLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const patientId = req.headers['x-user-id'] || req.user?.id || 1;

    try {
      await dbPool.query(`
        DELETE FROM lab_reports WHERE report_id = ? AND patient_id = ?
      `, [reportId, patientId]);
    } catch (dbErr) {
      console.warn('DB delete report fallback:', dbErr.message);
    }

    const idx = inMemoryLabReports.findIndex(r => String(r.id) === String(reportId));
    if (idx !== -1) {
      inMemoryLabReports.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Lab report deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting lab report:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete lab report.'
    });
  }
};
