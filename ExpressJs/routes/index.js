import { Router } from 'express';
import aiRoutes from './aiRoutes.js';
import { getAllDoctors, getDoctorById } from '../controllers/doctorController.js';
import { loginUser, registerPatient, registerDoctor } from '../controllers/userController.js';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientController.js';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { 
  getPaymentsByPatient, 
  getReviewsByPatient, 
  getPendingDoctors, 
  approveDoctor, 
  rejectDoctor 
} from '../controllers/otherControllers.js';

const apiRouter = Router();

// AI Routes
apiRouter.use('/ai', aiRoutes);

// Auth & Users
apiRouter.post('/users/login', loginUser);
apiRouter.post('/patients/signup', registerPatient);
apiRouter.post('/doctors/signup', registerDoctor);

// Doctors
apiRouter.get('/doctors', getAllDoctors);
apiRouter.get('/doctors/:id', getDoctorById);

// Patients
apiRouter.get('/patients/:id', getPatientProfile);
apiRouter.put('/patients/:id', updatePatientProfile);

// Appointments
apiRouter.get('/appointments', getAppointments);
apiRouter.post('/appointments', createAppointment);
apiRouter.put('/appointments/:id/status', updateAppointmentStatus);

// Payments & Reviews
apiRouter.get('/payments/patient/:id', getPaymentsByPatient);
apiRouter.get('/reviews/patient/:id', getReviewsByPatient);

// Admin
apiRouter.get('/admin/pending-doctors', getPendingDoctors);
apiRouter.put('/admin/approve-doctor/:id', approveDoctor);
apiRouter.put('/admin/reject-doctor/:id', rejectDoctor);

export default apiRouter;
