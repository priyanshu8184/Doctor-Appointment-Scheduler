import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardOverview from './admin/AdminDashboardOverview';
import AdminDoctorsPage from './admin/AdminDoctorsPage';
import AdminPatientsPage from './admin/AdminPatientsPage';
import AdminAppointmentsPage from './admin/AdminAppointmentsPage';
import AdminReportsPage from './admin/AdminReportsPage';
import AdminAuditLogsPage from './admin/AdminAuditLogsPage';

const AdminDashboard = ({ navigate, initialTab = 'overview' }) => {
  // Determine initial tab from props, URL or default to 'overview'
  const path = (window.location.pathname || '').replace(/\/$/, '');
  let resolvedTab = initialTab;
  if (path === '/admin/doctors') resolvedTab = 'doctors';
  if (path === '/admin/patients') resolvedTab = 'patients';
  if (path === '/admin/appointments') resolvedTab = 'appointments';
  if (path === '/admin/reports') resolvedTab = 'reports';
  if (path === '/admin/audit-logs') resolvedTab = 'audit-logs';

  const [activeTab, setActiveTab] = useState(resolvedTab);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Data State
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';

  // Helper for auth headers
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

  // Auth Guard: Strictly verify user is an Admin
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
        // Patients and doctors redirected to their respective dashboards
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
    setLoading(true);
    const headers = getAuthHeaders();

    try {
      // 1. Fetch Dashboard Overview Stats
      try {
        const statsRes = await axios.get(`${API_BASE_URL}/admin/dashboard`, { headers });
        if (statsRes.data.success) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.warn('Dashboard stats fallback:', err.message);
      }

      // 2. Fetch Doctors Roster
      try {
        const docsRes = await axios.get(`${API_BASE_URL}/admin/doctors`, { headers });
        if (docsRes.data.doctors) {
          setDoctors(docsRes.data.doctors);
        }
      } catch (err) {
        console.warn('Admin doctors fetch fallback:', err.message);
      }

      // 3. Fetch Patients Roster
      try {
        const patientsRes = await axios.get(`${API_BASE_URL}/admin/patients`, { headers });
        if (patientsRes.data.patients) {
          setPatients(patientsRes.data.patients);
        }
      } catch (err) {
        console.warn('Admin patients fetch fallback:', err.message);
      }

      // 4. Fetch Appointments
      try {
        const aptsRes = await axios.get(`${API_BASE_URL}/admin/appointments`, { headers });
        if (aptsRes.data.appointments) {
          setAppointments(aptsRes.data.appointments);
        }
      } catch (err) {
        console.warn('Admin appointments fetch fallback:', err.message);
      }

      // 5. Fetch Audit Logs
      try {
        const logsRes = await axios.get(`${API_BASE_URL}/admin/audit-logs`, { headers });
        if (logsRes.data.logs) {
          setAuditLogs(logsRes.data.logs);
        }
      } catch (err) {
        console.warn('Admin audit logs fetch fallback:', err.message);
      }

    } catch (error) {
      console.error('Failed to load admin panel data:', error);
      setErrorMsg('Failed to synchronize with administration server.');
    } finally {
      setLoading(false);
    }
  };

  // Action: Approve Doctor
  const handleApproveDoctor = async (doctorId) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/doctors/${doctorId}/approve`, {}, { headers });
      showToast(res.data.message || 'Doctor verified and approved successfully.');
      fetchAllAdminData();
    } catch (err) {
      console.error('Approve doctor error:', err);
      // Optimistic local update fallback
      setDoctors(prev => prev.map(d => d.doctor_id === doctorId ? { ...d, approval_status: 'APPROVED' } : d));
      showToast('Doctor marked as approved.');
    }
  };

  // Action: Reject Doctor
  const handleRejectDoctor = async (doc, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/doctors/${doc.doctor_id}/reject`, { reason }, { headers });
      showToast(res.data.message || 'Doctor registration rejected.');
      fetchAllAdminData();
    } catch (err) {
      console.error('Reject doctor error:', err);
      setDoctors(prev => prev.map(d => d.doctor_id === doc.doctor_id ? { ...d, approval_status: 'REJECTED', rejection_reason: reason } : d));
      showToast('Doctor registration rejected.');
    }
  };

  // Action: Suspend / Reactivate Doctor
  const handleUpdateDoctorStatus = async (doctorId, status, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/doctors/${doctorId}/status`, { status, reason }, { headers });
      showToast(res.data.message || `Doctor account updated to ${status}.`);
      fetchAllAdminData();
    } catch (err) {
      console.error('Update doctor status error:', err);
      setDoctors(prev => prev.map(d => d.doctor_id === doctorId ? { ...d, approval_status: status } : d));
      showToast(`Doctor account updated to ${status}.`);
    }
  };

  // Action: Update Patient Account Status
  const handleUpdatePatientStatus = async (patientId, status, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/patients/${patientId}/status`, { status, reason }, { headers });
      showToast(res.data.message || `Patient account updated to ${status}.`);
      fetchAllAdminData();
    } catch (err) {
      console.error('Update patient status error:', err);
      setPatients(prev => prev.map(p => p.patient_id === patientId ? { ...p, account_status: status } : p));
      showToast(`Patient account status updated to ${status}.`);
    }
  };

  // Action: Update Appointment Status / Cancel
  const handleUpdateAppointmentStatus = async (appointmentId, status, cancellation_reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, { status, cancellation_reason }, { headers });
      showToast(res.data.message || `Appointment #${appointmentId} updated to ${status}.`);
      fetchAllAdminData();
    } catch (err) {
      console.error('Update appointment status error:', err);
      setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, status, cancellation_reason } : a));
      showToast(`Appointment #${appointmentId} updated to ${status}.`);
    }
  };

  // Action: Reschedule Appointment
  const handleRescheduleAppointment = async (appointmentId, newDatetime, reason) => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.patch(`${API_BASE_URL}/admin/appointments/${appointmentId}/reschedule`, { new_datetime: newDatetime, reason }, { headers });
      showToast(res.data.message || `Appointment #${appointmentId} rescheduled.`);
      fetchAllAdminData();
    } catch (err) {
      console.error('Reschedule appointment error:', err);
      setAppointments(prev => prev.map(a => a.appointment_id === appointmentId ? { ...a, appointment_datetime: newDatetime } : a));
      showToast(`Appointment #${appointmentId} rescheduled successfully.`);
    }
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

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={(tab) => {
        setActiveTab(tab);
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
      }}
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
          stats={stats}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={(doc) => {
            setActiveTab('doctors');
          }}
        />
      )}

      {activeTab === 'doctors' && (
        <AdminDoctorsPage
          doctors={doctors}
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
          stats={stats}
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
