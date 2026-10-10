/**
 * Admin Module Aggregator & Delegator Controller
 * Refactored into modular sub-controllers for high maintainability
 */

export { 
  mockAdminUsers, 
  mockDoctors, 
  mockPatients, 
  mockAppointments, 
  mockAuditLogs 
} from '../data/adminMockStore.js';

export { 
  recordAuditLog 
} from '../services/auditService.js';

export {
  adminLogin,
  provisionAdmin
} from './admin/adminAuthController.js';

export {
  getAdminDashboardStats,
  getAdminReports,
  exportDataCsv,
  getAdminAuditLogs
} from './admin/adminStatsController.js';

export {
  getAdminDoctors,
  getAdminDoctorById,
  approveDoctor,
  rejectDoctor,
  updateDoctorStatus
} from './admin/adminDoctorController.js';

export {
  getAdminPatients,
  updatePatientStatus
} from './admin/adminPatientController.js';

export {
  getFilteredAppointmentsList,
  getAdminAppointments,
  getAdminAppointmentById,
  updateAdminAppointmentStatus,
  rescheduleAdminAppointment,
  exportAppointmentsPdf,
  exportSingleAppointmentPdf,
  exportAppointmentsImage,
  exportSingleAppointmentImage
} from './admin/adminAppointmentController.js';
