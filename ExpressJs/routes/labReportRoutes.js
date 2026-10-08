import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadAndAnalyzeLabReport,
  getPatientLabReports,
  getLabReportById,
  getReportRecommendations,
  getSampleLabReports,
  getLabReportTrends,
  deleteLabReport
} from '../controllers/labReportController.js';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'lab-reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'text/plain'
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|jpe?g|png|webp|txt)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload PDF, PNG, JPG, or JPEG.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum limit
  }
});

// POST /api/lab-reports/upload - Upload and analyze
router.post('/upload', upload.single('reportFile'), uploadAndAnalyzeLabReport);

// POST /api/lab-reports/:id/analyze - Re-analyze report
router.post('/:id/analyze', uploadAndAnalyzeLabReport);

// GET /api/lab-reports - Get patient's reports
router.get('/', getPatientLabReports);

// GET /api/lab-reports/samples - Get pre-configured demo reports
router.get('/samples', getSampleLabReports);

// GET /api/lab-reports/trends - Longitudinal biomarker health trends
router.get('/trends', getLabReportTrends);

// GET /api/lab-reports/:id - Get single report analysis
router.get('/:id', getLabReportById);

// GET /api/lab-reports/:id/recommendations - Get doctor recommendations for report
router.get('/:id/recommendations', getReportRecommendations);

// DELETE /api/lab-reports/:id - Delete report
router.delete('/:id', deleteLabReport);

export default router;
