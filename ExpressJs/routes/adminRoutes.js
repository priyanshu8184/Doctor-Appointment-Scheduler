import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
  adminLogin,
  provisionAdmin,
  getAdminDashboardStats,
  getAdminDoctors,
  getAdminDoctorById,
  approveDoctor,
  rejectDoctor,
  updateDoctorStatus,
  getAdminPatients,
  updatePatientStatus,
  getAdminAppointments,
  getAdminAppointmentById,
  updateAdminAppointmentStatus,
  rescheduleAdminAppointment,
  getAdminReports,
  exportDataCsv,
  getAdminAuditLogs,
  exportAppointmentsPdf,
  exportSingleAppointmentPdf,
  exportAppointmentsImage,
  exportSingleAppointmentImage
} from '../controllers/adminController.js';

const adminRouter = Router();

// Public / Setup Admin Routes
adminRouter.post('/login', adminLogin);
adminRouter.post('/provision', provisionAdmin);

// Protected Admin Endpoints (Require valid JWT with ADMIN role)
adminRouter.use(verifyToken, requireAdmin);

// Dashboard & Analytics
adminRouter.get('/dashboard', getAdminDashboardStats);
adminRouter.get('/stats', getAdminDashboardStats);

// Doctor Verification & Directory Management
adminRouter.get('/doctors', getAdminDoctors);
adminRouter.get('/doctors/:id', getAdminDoctorById);
adminRouter.patch('/doctors/:id/approve', approveDoctor);
adminRouter.put('/doctors/:id/approve', approveDoctor);
adminRouter.patch('/doctors/:id/reject', rejectDoctor);
adminRouter.put('/doctors/:id/reject', rejectDoctor);
adminRouter.patch('/doctors/:id/status', updateDoctorStatus);

// Patient Account Management
adminRouter.get('/patients', getAdminPatients);
adminRouter.patch('/patients/:id/status', updatePatientStatus);

// Appointment Monitoring, Resolution & Exports
adminRouter.get('/appointments/export/pdf', exportAppointmentsPdf);
adminRouter.get('/appointments/export/image', exportAppointmentsImage);
adminRouter.get('/appointments/export/png', exportAppointmentsImage);
adminRouter.get('/appointments/export/jpg', exportAppointmentsImage);

adminRouter.get('/appointments/:id/export/pdf', exportSingleAppointmentPdf);
adminRouter.get('/appointments/:id/export/image', exportSingleAppointmentImage);
adminRouter.get('/appointments/:id/export/png', exportSingleAppointmentImage);
adminRouter.get('/appointments/:id/export/jpg', exportSingleAppointmentImage);

adminRouter.get('/appointments', getAdminAppointments);
adminRouter.get('/appointments/:id', getAdminAppointmentById);
adminRouter.patch('/appointments/:id/status', updateAdminAppointmentStatus);
adminRouter.patch('/appointments/:id/reschedule', rescheduleAdminAppointment);

// Reports, Analytics & Export
adminRouter.get('/reports', getAdminReports);
adminRouter.get('/export/csv', exportDataCsv);

// Audit Logging
adminRouter.get('/audit-logs', getAdminAuditLogs);

export default adminRouter;
