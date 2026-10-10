import { Router } from 'express';
import aiRoutes from './aiRoutes.js';
import labReportRoutes from './labReportRoutes.js';
import adminRouter from './adminRoutes.js';
import { getAllDoctors, getDoctorById } from '../controllers/doctorController.js';
import { loginUser, registerPatient, registerDoctor } from '../controllers/userController.js';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientController.js';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { 
  getPaymentsByPatient, 
  getReviewsByPatient, 
  createReview,
  getPendingDoctors, 
  approveDoctor, 
  rejectDoctor 
} from '../controllers/otherControllers.js';

import { optionalAuth, verifyToken, requirePatient, requireDoctor } from '../middleware/authMiddleware.js';

const apiRouter = Router();

// AI & Lab Report Routes
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/lab-reports', labReportRoutes);

// Admin Routes (Complete Role-based Protected Panel)
apiRouter.use('/admin', adminRouter);

// Auth & Users
apiRouter.post('/users/login', loginUser);
apiRouter.post('/patients/signup', registerPatient);
apiRouter.post('/doctors/signup', registerDoctor);

// Doctors
apiRouter.get('/doctors', getAllDoctors);
apiRouter.get('/doctors/:id', getDoctorById);

// Patients
apiRouter.get('/patients/:id', optionalAuth, getPatientProfile);
apiRouter.put('/patients/:id', optionalAuth, updatePatientProfile);

// Appointments
apiRouter.get('/appointments', optionalAuth, getAppointments);
apiRouter.post('/appointments', optionalAuth, createAppointment);
apiRouter.put('/appointments/:id/status', optionalAuth, updateAppointmentStatus);
apiRouter.patch('/appointments/:id/status', optionalAuth, updateAppointmentStatus);

// Payments & Reviews
apiRouter.get('/payments/patient/:id', getPaymentsByPatient);
apiRouter.get('/reviews/patient/:id', getReviewsByPatient);
apiRouter.post('/reviews', createReview);

export default apiRouter;

