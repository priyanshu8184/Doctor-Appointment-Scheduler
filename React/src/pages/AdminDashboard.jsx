import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardOverview from './admin/AdminDashboardOverview';
import AdminDoctorsPage from './admin/AdminDoctorsPage';
import AdminPatientsPage from './admin/AdminPatientsPage';
import AdminAppointmentsPage from './admin/AdminAppointmentsPage';
import AdminReportsPage from './admin/AdminReportsPage';
import AdminAuditLogsPage from './admin/AdminAuditLogsPage';
import { useAdminData } from '../hooks/useAdminData';

// Re-export initial datasets for backward compatibility
export {
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_AUDIT_LOGS
} from '../data/adminInitialData';

const PAGE_TITLE_MAP = {
  overview: 'Clinical Platform Telemetry & Overview',
  doctors: 'Doctor Verification & Directory Governance',
  patients: 'Patient Accounts & Identity Management',
  appointments: 'Appointment Monitoring & Resolution',
  reports: 'Governance Reports & Data Analytics',
  'audit-logs': 'Security & Action Audit Logs'
};

const TAB_PATH_MAP = {
  overview: '/admin/dashboard',
  doctors: '/admin/doctors',
  patients: '/admin/patients',
  appointments: '/admin/appointments',
  reports: '/admin/reports',
  'audit-logs': '/admin/audit-logs'
};

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

  const {
    doctors,
    patients,
    appointments,
    auditLogs,
    stats,
    loading,
    toastMsg,
    pendingApprovalsCount,
    handleApproveDoctor,
    handleRejectDoctor,
    handleUpdateDoctorStatus,
    handleUpdatePatientStatus,
    handleUpdateAppointmentStatus,
    handleRescheduleAppointment
  } = useAdminData(navigate);

  const handleSelectTab = (tab, filter = 'ALL') => {
    setActiveTab(tab);
    if (tab === 'doctors' && filter) {
      setDoctorStatusFilter(filter);
    }
    if (navigate && TAB_PATH_MAP[tab]) {
      navigate(TAB_PATH_MAP[tab]);
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      navigate={navigate}
      pendingApprovalsCount={pendingApprovalsCount}
      pageTitle={PAGE_TITLE_MAP[activeTab] || 'Admin Dashboard'}
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
          onNavigateTab={handleSelectTab}
          onApproveDoctor={handleApproveDoctor}
          onRejectDoctor={() => {
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
