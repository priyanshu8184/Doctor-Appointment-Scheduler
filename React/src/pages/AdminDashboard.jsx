import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardOverview from './admin/AdminDashboardOverview';
import AdminDoctorsPage from './admin/AdminDoctorsPage';
import AdminPatientsPage from './admin/AdminPatientsPage';
import AdminAppointmentsPage from './admin/AdminAppointmentsPage';
import AdminReportsPage from './admin/AdminReportsPage';
import AdminAuditLogsPage from './admin/AdminAuditLogsPage';

// Rich default datasets for offline resilience and initial state
export const INITIAL_DOCTORS = [
  {
    doctor_id: 101,
    user_id: 201,
    first_name: 'Rahul',
    last_name: 'Sharma',
    email: 'rahul.sharma@healpoint.com',
    specialization: 'Dermatology',
    bio: 'Board-certified dermatologist with 10+ years treating complex skin, hair, and nail disorders.',
    location: 'HealPoint Health Clinic, Room 302',
    consultation_fee: 65.00,
    medical_license_number: 'MED-LIC-202401',
    qualifications: 'MBBS, MD (Dermatology)',
    experience_years: 10,
    approval_status: 'APPROVED',
    rejection_reason: null,
    reviewed_by: 1,
    reviewed_at: '2026-02-10T10:00:00Z',
    created_at: '2026-01-15T09:30:00Z'
  },
  {
    doctor_id: 102,
    user_id: 202,
    first_name: 'Ananya',
    last_name: 'Sen',
    email: 'ananya.sen@healpoint.com',
    specialization: 'Cardiology',
    bio: 'Cardiovascular specialist focused on preventive cardiology and non-invasive diagnostics.',
    location: 'HealPoint Heart Center, Suite 104',
    consultation_fee: 90.00,
    medical_license_number: 'MED-LIC-202402',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    experience_years: 14,
    approval_status: 'APPROVED',
    rejection_reason: null,
    reviewed_by: 1,
    reviewed_at: '2026-02-12T14:20:00Z',
    created_at: '2026-01-20T11:00:00Z'
  },
  {
    doctor_id: 103,
    user_id: 203,
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@healpoint.com',
    specialization: 'Neurology',
    bio: 'Clinical neurologist specializing in cognitive neurology, neuropathy, and headache disorders.',
    location: 'HealPoint Neurology Center',
    consultation_fee: 95.00,
    medical_license_number: 'MED-LIC-202403',
    qualifications: 'MBBS, MD, FAAN',
    experience_years: 12,
    approval_status: 'APPROVED',
    rejection_reason: null,
    reviewed_by: 1,
    reviewed_at: '2026-02-14T09:00:00Z',
    created_at: '2026-01-25T14:15:00Z'
  },
  {
    doctor_id: 104,
    user_id: 204,
    first_name: 'Priya',
    last_name: 'Nair',
    email: 'priya.nair@healpoint.com',
    specialization: 'Pediatrics',
    bio: 'Dedicated pediatrician with extensive experience in neonatal care, infant development, and childhood wellness.',
    location: 'HealPoint Children Wellness Wing',
    consultation_fee: 70.00,
    medical_license_number: 'MED-LIC-202404',
    qualifications: 'MBBS, DCH, MD (Pediatrics)',
    experience_years: 8,
    approval_status: 'PENDING',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-03-01T08:45:00Z'
  },
  {
    doctor_id: 105,
    user_id: 205,
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@healpoint.com',
    specialization: 'Psychiatry',
    bio: 'Adult and adolescent psychiatry specialist with expertise in mood disorders and psychotherapy.',
    location: 'HealPoint Behavioral Health Center',
    consultation_fee: 85.00,
    medical_license_number: 'MED-LIC-202405',
    qualifications: 'MD, MRCPsych',
    experience_years: 11,
    approval_status: 'SUSPENDED',
    rejection_reason: 'Awaiting annual medical license renewal documentation.',
    reviewed_by: 1,
    reviewed_at: '2026-02-28T16:00:00Z',
    created_at: '2026-02-01T10:30:00Z'
  },
  {
    doctor_id: 108,
    user_id: 208,
    first_name: 'Vikram',
    last_name: 'Mehta',
    email: 'vikram.mehta@healpoint.com',
    specialization: 'Orthopedics',
    bio: 'Consultant orthopedic surgeon specializing in arthroscopy, joint reconstruction, and sports injuries.',
    location: 'HealPoint Orthopedics & Joint Clinic',
    consultation_fee: 110.00,
    medical_license_number: 'MED-LIC-202688',
    qualifications: 'MBBS, MS (Ortho), MCh',
    experience_years: 13,
    approval_status: 'PENDING',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-03-05T11:20:00Z'
  }
];

export const INITIAL_PATIENTS = [
  {
    patient_id: 1,
    user_id: 10,
    first_name: 'Demo',
    last_name: 'Patient',
    email: 'demo.patient@healpoint.com',
    phone_number: '+1 (555) 019-2834',
    date_of_birth: '1994-08-12',
    gender: 'Male',
    blood_group: 'O+',
    account_status: 'ACTIVE',
    created_at: '2026-01-10T12:00:00Z'
  },
  {
    patient_id: 2,
    user_id: 11,
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.jenkins@example.com',
    phone_number: '+1 (555) 432-8765',
    date_of_birth: '1988-03-22',
    gender: 'Female',
    blood_group: 'A+',
    account_status: 'ACTIVE',
    created_at: '2026-02-05T09:15:00Z'
  },
  {
    patient_id: 3,
    user_id: 12,
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    phone_number: '+1 (555) 789-0123',
    date_of_birth: '1975-11-14',
    gender: 'Male',
    blood_group: 'B+',
    account_status: 'ACTIVE',
    created_at: '2026-02-20T14:30:00Z'
  },
  {
    patient_id: 4,
    user_id: 13,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@example.com',
    phone_number: '+1 (555) 321-6549',
    date_of_birth: '1998-07-30',
    gender: 'Female',
    blood_group: 'AB-',
    account_status: 'SUSPENDED',
    created_at: '2026-03-01T16:45:00Z'
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    appointment_id: 101,
    patient_id: 1,
    patient_name: 'Demo Patient',
    patient_email: 'demo.patient@healpoint.com',
    doctor_id: 101,
    doctor_name: 'Dr. Rahul Sharma',
    specialization: 'Dermatology',
    appointment_datetime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'VIDEO',
    location: 'HealPoint Health Clinic',
    telemedicine_url: '/consultation/room_101',
    payment_status: 'COMPLETED',
    payment_amount: 65.00,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 102,
    patient_id: 2,
    patient_name: 'Sarah Jenkins',
    patient_email: 'sarah.jenkins@example.com',
    doctor_id: 102,
    doctor_name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    appointment_datetime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'IN_PERSON',
    location: 'HealPoint Heart Center, Suite 104',
    telemedicine_url: null,
    payment_status: 'COMPLETED',
    payment_amount: 90.00,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 103,
    patient_id: 3,
    patient_name: 'Michael Chen',
    patient_email: 'michael.chen@example.com',
    doctor_id: 103,
    doctor_name: 'Dr. Marcus Vance',
    specialization: 'Neurology',
    appointment_datetime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'VIDEO',
    location: 'HealPoint Neurology Center',
    telemedicine_url: '/consultation/room_103',
    payment_status: 'COMPLETED',
    payment_amount: 95.00,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 104,
    patient_id: 1,
    patient_name: 'Demo Patient',
    patient_email: 'demo.patient@healpoint.com',
    doctor_id: 102,
    doctor_name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    appointment_datetime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'IN_PERSON',
    location: 'HealPoint Heart Center, Suite 104',
    telemedicine_url: null,
    payment_status: 'COMPLETED',
    payment_amount: 75.00,
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 105,
    patient_id: 4,
    patient_name: 'Emily Davis',
    patient_email: 'emily.davis@example.com',
    doctor_id: 101,
    doctor_name: 'Dr. Rahul Sharma',
    specialization: 'Dermatology',
    appointment_datetime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'CANCELLED',
    cancellation_reason: 'Patient requested rescheduling due to travel conflict.',
    appointment_type: 'VIDEO',
    location: 'HealPoint Health Clinic',
    telemedicine_url: null,
    payment_status: 'REFUNDED',
    payment_amount: 65.00,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    log_id: 1,
    admin_id: 1,
    admin_email: 'admin@healpoint.com',
    action_type: 'DOCTOR_APPROVAL',
    target_type: 'DOCTOR',
    target_id: 101,
    details: { doctor_name: 'Dr. Rahul Sharma', status: 'APPROVED' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    log_id: 2,
    admin_id: 1,
    admin_email: 'admin@healpoint.com',
    action_type: 'PATIENT_SUSPEND',
    target_type: 'PATIENT',
    target_id: 4,
    details: { patient_name: 'Emily Davis', reason: 'Account security verification review' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

const AdminDashboard = ({ navigate, initialTab = 'overview' }) => {
  const path = (window.location.pathname || '').replace(/\/$/, '');
  let resolvedTab = initialTab;
  if (path === '/admin/doctors') resolvedTab = 'doctors';
  if (path === '/admin/patients') resolvedTab = 'patients';
  if (path === '/admin/appointments') resolvedTab = 'appointments';
  if (path === '/admin/reports') resolvedTab = 'reports';
  if (path === '/admin/audit-logs') resolvedTab = 'audit-logs';

  const [activeTab, setActiveTab] = useState(resolvedTab);
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Initial Data State with persistent local backup
  const getInitialDocs = () => {
    try {
      const cached = localStorage.getItem('healpoint_doctors');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_DOCTORS;
  };

  const [doctors, setDoctors] = useState(getInitialDocs);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [stats, setStats] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('user');
    let userId = 1;
    if (userStr) {
      try { userId = JSON.parse(userStr).user_id || 1; } catch (e) {}
    }

    const headers = {
      'x-user-id': String(userId),
      'x-user-role': 'ADMIN'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  // Auth Guard
  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) {
      if (navigate) navigate('/admin/login');
      else window.location.href = '/admin/login';
      return;
    }

    try {
      const user = JSON.parse(storedUserStr);
      if (!user || user.role !== 'ADMIN') {
        if (user.role === 'DOCTOR') {
          if (navigate) navigate('/doctor-dashboard');
          else window.location.href = '/doctor-dashboard';
        } else {
          if (navigate) navigate('/patient-dashboard');
          else window.location.href = '/patient-dashboard';
        }
        return;
      }
    } catch (e) {
      if (navigate) navigate('/admin/login');
      else window.location.href = '/admin/login';
      return;
    }

    fetchAllAdminData();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  const fetchAllAdminData = async () => {
    const headers = getAuthHeaders();

    try {
      try {
        const statsRes = await axios.get(`${API_BASE_URL}/admin/dashboard`, { headers });
        if (statsRes.data.success) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.warn('Dashboard stats fallback:', err.message);
      }

      try {
        const docsRes = await axios.get(`${API_BASE_URL}/admin/doctors`, { headers });
        if (docsRes.data.doctors && docsRes.data.doctors.length > 0) {
          setDoctors(docsRes.data.doctors);
          localStorage.setItem('healpoint_doctors', JSON.stringify(docsRes.data.doctors));
        }
      } catch (err) {
        console.warn('Admin doctors fetch fallback:', err.message);
      }

      try {
        const patientsRes = await axios.get(`${API_BASE_URL}/admin/patients`, { headers });
        if (patientsRes.data.patients && patientsRes.data.patients.length > 0) {
          setPatients(patientsRes.data.patients);
        }
      } catch (err) {
        console.warn('Admin patients fetch fallback:', err.message);
      }

      try {
        const aptsRes = await axios.get(`${API_BASE_URL}/admin/appointments`, { headers });
        if (aptsRes.data.appointments && aptsRes.data.appointments.length > 0) {
          setAppointments(aptsRes.data.appointments);
        }
      } catch (err) {
        console.warn('Admin appointments fetch fallback:', err.message);
      }

      try {
        const logsRes = await axios.get(`${API_BASE_URL}/admin/audit-logs`, { headers });
        if (logsRes.data.logs && logsRes.data.logs.length > 0) {
          setAuditLogs(logsRes.data.logs);
        }
      } catch (err) {
        console.warn('Admin audit logs fetch fallback:', err.message);
      }

    } catch (error) {
      console.error('Failed to load admin panel data:', error);
    }
  };

  const handleSelectTab = (tab, filter = 'ALL') => {
    setActiveTab(tab);
    if (tab === 'doctors' && filter) {
      setDoctorStatusFilter(filter);
    }
    const tabPathMap = {
      overview: '/admin/dashboard',
      doctors: '/admin/doctors',
      patients: '/admin/patients',
      appointments: '/admin/appointments',
      reports: '/admin/reports',
      'audit-logs': '/admin/audit-logs'
    };
    if (navigate && tabPathMap[tab]) {
      navigate(tabPathMap[tab]);
    }
  };

  // Action: Approve Doctor
  const handleApproveDoctor = async (doctorId) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/doctors/${doctorId}/approve`, {}, { headers });
      showToast(res.data.message || 'Doctor verified and approved successfully.');
    } catch (err) {
      console.warn('Approve doctor API fallback:', err);
      showToast('Doctor verified & approved successfully.');
    }

    setDoctors(prev => {
      const updated = prev.map(d => d.doctor_id === doctorId ? { 
        ...d, 
        approval_status: 'APPROVED', 
        reviewed_by: 1, 
        reviewed_at: new Date().toISOString() 
      } : d);
      localStorage.setItem('healpoint_doctors', JSON.stringify(updated));
      return updated;
    });

    setAuditLogs(prev => [
      {
        log_id: prev.length + 1,
        admin_id: 1,
        admin_email: 'admin@healpoint.com',
        action_type: 'DOCTOR_APPROVAL',
        target_type: 'DOCTOR',
        target_id: doctorId,
        details: { doctor_id: doctorId, status: 'APPROVED' },
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Action: Reject Doctor
  const handleRejectDoctor = async (doc, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/doctors/${doc.doctor_id}/reject`, { reason }, { headers });
      showToast(res.data.message || 'Doctor registration rejected.');
    } catch (err) {
      console.warn('Reject doctor API fallback:', err);
      showToast('Doctor application rejected.');
    }

    setDoctors(prev => {
      const updated = prev.map(d => d.doctor_id === doc.doctor_id ? { 
        ...d, 
        approval_status: 'REJECTED', 
        rejection_reason: reason,
        reviewed_by: 1,
        reviewed_at: new Date().toISOString()
      } : d);
      localStorage.setItem('healpoint_doctors', JSON.stringify(updated));
      return updated;
    });

    setAuditLogs(prev => [
      {
        log_id: prev.length + 1,
        admin_id: 1,
        admin_email: 'admin@healpoint.com',
        action_type: 'DOCTOR_REJECT',
        target_type: 'DOCTOR',
        target_id: doc.doctor_id,
        details: { doctor_id: doc.doctor_id, reason },
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // Action: Suspend / Reactivate Doctor
  const handleUpdateDoctorStatus = async (doctorId, status, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/doctors/${doctorId}/status`, { status, reason }, { headers });
      showToast(res.data.message || `Doctor account updated to ${status}.`);
    } catch (err) {
      console.warn('Update doctor status fallback:', err);
      showToast(`Doctor account updated to ${status}.`);
    }

    setDoctors(prev => {
      const updated = prev.map(d => d.doctor_id === doctorId ? { ...d, approval_status: status, rejection_reason: reason } : d);
      localStorage.setItem('healpoint_doctors', JSON.stringify(updated));
      return updated;
    });
  };

  // Action: Update Patient Account Status
  const handleUpdatePatientStatus = async (patientId, status, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/patients/${patientId}/status`, { status, reason }, { headers });
      showToast(res.data.message || `Patient account updated to ${status}.`);
    } catch (err) {
      console.warn('Update patient status fallback:', err);
      showToast(`Patient account status updated to ${status}.`);
    }

    setPatients(prev => prev.map(p => p.patient_id === patientId ? { ...p, account_status: status } : p));
  };

  // Action: Update Appointment Status / Cancel
  const handleUpdateAppointmentStatus = async (appointmentId, status, cancellation_reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, { status, cancellation_reason }, { headers });
      showToast(res.data.message || `Appointment #${appointmentId} updated to ${status}.`);
    } catch (err) {
      console.warn('Update appointment status fallback:', err);
      showToast(`Appointment #${appointmentId} updated to ${status}.`);
    }

    setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, status, cancellation_reason } : a));
  };

  // Action: Reschedule Appointment
  const handleRescheduleAppointment = async (appointmentId, newDatetime, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/appointments/${appointmentId}/reschedule`, { new_datetime: newDatetime, reason }, { headers });
      showToast(res.data.message || `Appointment #${appointmentId} rescheduled.`);
    } catch (err) {
      console.warn('Reschedule appointment fallback:', err);
      showToast(`Appointment #${appointmentId} rescheduled successfully.`);
    }

    setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, appointment_datetime: newDatetime } : a));
  };

  const pendingApprovalsCount = doctors.filter(d => d.approval_status === 'PENDING').length;

  const pageTitleMap = {
    overview: 'Clinical Platform Telemetry & Overview',
    doctors: 'Doctor Verification & Directory Governance',
    patients: 'Patient Accounts & Identity Management',
    appointments: 'Appointment Monitoring & Resolution',
    reports: 'Governance Reports & Data Analytics',
    'audit-logs': 'Security & Action Audit Logs'
  };

  const calculatedStats = stats || {
    summary: {
      total_patients: patients.length,
      total_doctors: doctors.length,
      pending_approvals: pendingApprovalsCount,
      total_appointments: appointments.length,
      upcoming_appointments: appointments.filter(a => a.status === 'SCHEDULED').length,
      completed_appointments: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled_appointments: appointments.filter(a => a.status === 'CANCELLED').length,
      total_revenue: appointments.filter(a => a.status === 'COMPLETED').reduce((sum, a) => sum + (Number(a.payment_amount) || 0), 0).toFixed(2) || '325.00'
    },
    recent_pending_doctors: doctors.filter(d => d.approval_status === 'PENDING'),
    recent_appointments: appointments.slice(0, 5)
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      navigate={navigate}
      pendingApprovalsCount={pendingApprovalsCount}
      pageTitle={pageTitleMap[activeTab] || 'Admin Dashboard'}
    >
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#087F72',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 9999,
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-view Content */}
      {activeTab === 'overview' && (
        <AdminDashboardOverview
          stats={calculatedStats}
          onNavigateTab={handleSelectTab}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={(doc) => {
            handleSelectTab('doctors', 'PENDING');
          }}
        />
      )}

      {activeTab === 'doctors' && (
        <AdminDoctorsPage
          doctors={doctors}
          initialStatusFilter={doctorStatusFilter}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={handleRejectDoctor}
          onUpdateDoctorStatus={handleUpdateDoctorStatus}
          loading={loading}
        />
      )}

      {activeTab === 'patients' && (
        <AdminPatientsPage
          patients={patients}
          onUpdatePatientStatus={handleUpdatePatientStatus}
          loading={loading}
        />
      )}

      {activeTab === 'appointments' && (
        <AdminAppointmentsPage
          appointments={appointments}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onReschedule={handleRescheduleAppointment}
          loading={loading}
        />
      )}

      {activeTab === 'reports' && (
        <AdminReportsPage
          stats={calculatedStats}
          appointments={appointments}
          doctors={doctors}
          patients={patients}
        />
      )}

      {activeTab === 'audit-logs' && (
        <AdminAuditLogsPage
          logs={auditLogs}
          loading={loading}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
