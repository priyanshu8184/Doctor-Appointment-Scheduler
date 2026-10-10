// Test suite for HealPoint Admin API & Controllers
import {
  adminLogin,
  getAdminDashboardStats,
  getAdminDoctors,
  approveDoctor,
  rejectDoctor,
  updateDoctorStatus,
  getAdminPatients,
  updatePatientStatus,
  getAdminAppointments,
  rescheduleAdminAppointment,
  updateAdminAppointmentStatus,
  getAdminReports,
  exportDataCsv,
  getAdminAuditLogs,
  exportAppointmentsPdf,
  exportSingleAppointmentPdf,
  exportAppointmentsImage,
  exportSingleAppointmentImage
} from './controllers/adminController.js';

import { Writable } from 'stream';

const runMockRes = () => {
  const chunks = [];
  const res = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    }
  });

  res.statusCode = 200;
  res.headers = {};
  res.data = null;
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(payload) {
    this.data = payload;
    return this;
  };
  res.setHeader = function(key, val) {
    this.headers[key] = val;
  };
  res.send = function(content) {
    this.data = content;
    return this;
  };

  return res;
};

async function runAdminTests() {
  console.log('🧪 Starting HealPoint Admin Panel Integration Tests...\n');
  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  };

  // Test 1: Admin Login
  await test('Feature 1: Admin Login with valid credentials', async () => {
    const req = { body: { email: 'admin@healpoint.com', password: 'Admin@12345' } };
    const res = runMockRes();
    await adminLogin(req, res);
    if (res.statusCode !== 200 || !res.data.token || res.data.user.role !== 'ADMIN') {
      throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
    }
  });

  // Test 2: Admin Login rejects empty password
  await test('Feature 1: Admin Login rejects missing credentials', async () => {
    const req = { body: { email: 'admin@healpoint.com', password: '' } };
    const res = runMockRes();
    await adminLogin(req, res);
    if (res.statusCode !== 400) {
      throw new Error(`Expected status 400, got ${res.statusCode}`);
    }
  });

  // Test 3: Dashboard Stats
  await test('Feature 5: Dashboard Overview Telemetry Aggregation', async () => {
    const req = { user: { user_id: 1, role: 'ADMIN' } };
    const res = runMockRes();
    await getAdminDashboardStats(req, res);
    if (!res.data.summary || !res.data.summary.total_patients || !res.data.charts) {
      throw new Error('Dashboard stats missing required summary or charts');
    }
  });

  // Test 4: Doctor Verification - Get Doctors List
  await test('Feature 2: Doctor Verification list and filter by status', async () => {
    const req = { query: { status: 'PENDING' }, user: { user_id: 1, role: 'ADMIN' } };
    const res = runMockRes();
    await getAdminDoctors(req, res);
    if (!Array.isArray(res.data.doctors)) {
      throw new Error('Doctors list should be an array');
    }
  });

  // Test 5: Approve Doctor
  await test('Feature 2: Approve pending doctor registration', async () => {
    const req = { params: { id: 108 }, user: { user_id: 1, email: 'admin@healpoint.com', role: 'ADMIN' } };
    const res = runMockRes();
    await approveDoctor(req, res);
    if (res.statusCode !== 200 || res.data.doctor.approval_status !== 'APPROVED') {
      throw new Error('Doctor approval status not set to APPROVED');
    }
  });

  // Test 6: Reject Doctor with Reason
  await test('Feature 2: Reject doctor application with mandatory reason', async () => {
    const req = { 
      params: { id: 108 }, 
      body: { reason: 'State license number could not be authenticated.' },
      user: { user_id: 1, email: 'admin@healpoint.com', role: 'ADMIN' } 
    };
    const res = runMockRes();
    await rejectDoctor(req, res);
    if (res.statusCode !== 200 || res.data.doctor.approval_status !== 'REJECTED' || !res.data.doctor.rejection_reason) {
      throw new Error('Doctor rejection failed or reason not recorded');
    }
  });

  // Test 7: Patient Account Management
  await test('Feature 3: Retrieve and filter patient accounts', async () => {
    const req = { query: { status: 'ACTIVE' }, user: { user_id: 1, role: 'ADMIN' } };
    const res = runMockRes();
    await getAdminPatients(req, res);
    if (!Array.isArray(res.data.patients) || res.data.patients.length === 0) {
      throw new Error('Active patients list empty');
    }
  });

  // Test 8: Suspend & Reactivate Patient Account
  await test('Feature 3: Suspend and Reactivate Patient Account', async () => {
    const reqSuspend = { 
      params: { id: 1 }, 
      body: { status: 'SUSPENDED', reason: 'Security verification review' },
      user: { user_id: 1, email: 'admin@healpoint.com', role: 'ADMIN' } 
    };
    const resSuspend = runMockRes();
    await updatePatientStatus(reqSuspend, resSuspend);
    if (resSuspend.data.patient.account_status !== 'SUSPENDED') {
      throw new Error('Patient status not updated to SUSPENDED');
    }

    const reqActive = { 
      params: { id: 1 }, 
      body: { status: 'ACTIVE' },
      user: { user_id: 1, email: 'admin@healpoint.com', role: 'ADMIN' } 
    };
    const resActive = runMockRes();
    await updatePatientStatus(reqActive, resActive);
    if (resActive.data.patient.account_status !== 'ACTIVE') {
      throw new Error('Patient status not restored to ACTIVE');
    }
  });

  // Test 9: Appointment Monitoring
  await test('Feature 4: Appointments monitoring list and search', async () => {
    const req = { query: { search: 'Demo' }, user: { user_id: 1, role: 'ADMIN' } };
    const res = runMockRes();
    await getAdminAppointments(req, res);
    if (!Array.isArray(res.data.appointments)) {
      throw new Error('Appointments response missing array');
    }
  });

  // Test 10: Reschedule Appointment with conflict protection
  await test('Feature 4: Reschedule appointment with valid datetime', async () => {
    const nextDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
    const req = { 
      params: { id: 101 }, 
      body: { new_datetime: nextDate, reason: 'Patient requested time change' },
      user: { user_id: 1, email: 'admin@healpoint.com', role: 'ADMIN' } 
    };
    const res = runMockRes();
    await rescheduleAdminAppointment(req, res);
    if (res.statusCode !== 200 || res.data.appointment.appointment_datetime !== nextDate) {
      throw new Error('Appointment rescheduling failed');
    }
  });

  // Test 11: Reports & CSV Export
  await test('Feature 5: Generate CSV export for appointments', async () => {
    const req = { query: { type: 'appointments' }, user: { user_id: 1, role: 'ADMIN' } };
    const res = runMockRes();
    await exportDataCsv(req, res);
    if (!res.data.includes('Appointment ID') || !res.data.includes('Patient Name')) {
      throw new Error('CSV export missing required headers');
    }
  });

  // Test 12: Security Audit Logs
  await test('Feature 1 & Security: Audit logs recording administrative interventions', async () => {
    const req = { query: {}, user: { user_id: 1, role: 'ADMIN' } };
    const res = runMockRes();
    await getAdminAuditLogs(req, res);
    if (!Array.isArray(res.data.logs) || res.data.logs.length === 0) {
      throw new Error('Audit logs missing or empty');
    }
  });

  // Test 13: Bulk Appointments PDF Export
  await test('Export Feature: Bulk appointments vector PDF report stream', async () => {
    const req = { query: { status: 'SCHEDULED' }, user: { user_id: 1, role: 'ADMIN', email: 'admin@healpoint.com' } };
    const res = runMockRes();
    await exportAppointmentsPdf(req, res);
    if (res.headers['Content-Type'] !== 'application/pdf') {
      throw new Error('PDF export Content-Type should be application/pdf');
    }
  });

  // Test 14: Single Appointment PDF Export
  await test('Export Feature: Single appointment verification slip PDF', async () => {
    const req = { params: { id: 101 }, user: { user_id: 1, role: 'ADMIN', email: 'admin@healpoint.com' } };
    const res = runMockRes();
    await exportSingleAppointmentPdf(req, res);
    if (res.headers['Content-Type'] !== 'application/pdf') {
      throw new Error('Single appointment PDF Content-Type should be application/pdf');
    }
  });

  // Test 15: Bulk Appointments Image Export
  await test('Export Feature: Bulk appointments image/SVG export', async () => {
    const req = { query: {}, user: { user_id: 1, role: 'ADMIN', email: 'admin@healpoint.com' } };
    const res = runMockRes();
    await exportAppointmentsImage(req, res);
    if (res.headers['Content-Type'] !== 'image/svg+xml' || !res.data.includes('HEALPOINT')) {
      throw new Error('Image export failed or missing branding header');
    }
  });

  // Test 16: Single Appointment Image Export
  await test('Export Feature: Single appointment image/SVG export', async () => {
    const req = { params: { id: 101 }, user: { user_id: 1, role: 'ADMIN', email: 'admin@healpoint.com' } };
    const res = runMockRes();
    await exportSingleAppointmentImage(req, res);
    if (res.headers['Content-Type'] !== 'image/svg+xml' || !res.data.includes('#101')) {
      throw new Error('Single appointment image export failed');
    }
  });

  console.log(`\n🎉 Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)\n`);
}

runAdminTests().catch(console.error);

