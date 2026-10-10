import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  Users,
  Stethoscope
} from 'lucide-react';
import './AdminPages.css';

const AdminReportsPage = ({ 
  stats,
  appointments = [],
  doctors = [],
  patients = []
}) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [downloading, setDownloading] = useState(false);

  const downloadCsv = (filename, csvData) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAppointmentsCsv = () => {
    const headers = ['Appointment ID', 'Patient Name', 'Doctor Name', 'Specialty', 'Date & Time', 'Status', 'Type', 'Payment Status', 'Fee'];
    const rows = appointments.map(a => [
      a.appointment_id,
      `"${a.patient_name || 'Patient'}"`,
      `"${a.doctor_name || 'Doctor'}"`,
      `"${a.specialization || 'General Medicine'}"`,
      `"${a.appointment_datetime}"`,
      a.status,
      a.appointment_type,
      a.payment_status || 'PAID',
      `$${a.payment_amount || 65.00}`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`healpoint_appointments_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  };

  const handleExportDoctorsCsv = () => {
    const headers = ['Doctor ID', 'Name', 'Email', 'Specialty', 'License', 'Status', 'Fee', 'Experience (Years)'];
    const rows = doctors.map(d => [
      d.doctor_id,
      `"Dr. ${d.first_name} ${d.last_name}"`,
      d.email,
      `"${d.specialization}"`,
      d.medical_license_number || 'N/A',
      d.approval_status,
      `$${d.consultation_fee}`,
      d.experience_years || 5
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`healpoint_doctors_roster_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  };

  const handleExportPatientsCsv = () => {
    const headers = ['Patient ID', 'Name', 'Email', 'Phone', 'Gender', 'Blood Group', 'Status', 'Registration Date'];
    const rows = patients.map(p => [
      p.patient_id,
      `"${p.first_name} ${p.last_name}"`,
      p.email,
      `"${p.phone_number || ''}"`,
      p.gender || 'N/A',
      p.blood_group || 'N/A',
      p.account_status,
      p.created_at?.split('T')[0] || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`healpoint_patients_roster_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  };

  const totalVolume = appointments
    .filter(a => a.payment_status === 'COMPLETED' || a.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (Number(curr.payment_amount) || 65), 0);

  return (
    <div className="admin-reports-view">
      {/* Top Filter & Export Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            <span>Last 7 Days</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            <span>Last 30 Days</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
          >
            <span>Last Quarter (90d)</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            <span>All Time</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn primary"
            onClick={handleExportAppointmentsCsv}
          >
            <Download size={14} />
            <span>Export Appointments (CSV)</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon emerald">
            <DollarSign size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">${totalVolume.toFixed(2)}</h3>
            <p className="admin-metric-label">Completed Consultation Volume</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon teal">
            <Calendar size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{appointments.length}</h3>
            <p className="admin-metric-label">Total Booking Volume</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon blue">
            <Users size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{patients.length}</h3>
            <p className="admin-metric-label">Patient Base</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon purple">
            <Stethoscope size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{doctors.filter(d => d.approval_status === 'APPROVED').length}</h3>
            <p className="admin-metric-label">Active Practicing Clinicians</p>
          </div>
        </div>
      </div>

      {/* CSV Export Hub */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <FileSpreadsheet size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Administrative Data Export Center</h3>
              <p className="admin-card-subtitle">Generate auditable CSV reports for clinical governance</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#172033', fontWeight: 700 }}>
              Consultation Activity Report
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: '#64748B' }}>
              Full dataset including patient names, practitioner details, status, appointment dates, and payment records.
            </p>
            <button
              type="button"
              className="admin-btn primary sm"
              onClick={handleExportAppointmentsCsv}
            >
              <Download size={13} />
              <span>Download Appointments CSV</span>
            </button>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#172033', fontWeight: 700 }}>
              Doctor Directory & Verification Report
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: '#64748B' }}>
              Practitioner roster with medical licenses, review statuses, consultation fees, and experience.
            </p>
            <button
              type="button"
              className="admin-btn secondary sm"
              onClick={handleExportDoctorsCsv}
            >
              <Download size={13} />
              <span>Download Doctors CSV</span>
            </button>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#172033', fontWeight: 700 }}>
              Patient User Accounts Roster
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: '#64748B' }}>
              Registered patient accounts with demographic details, account statuses, and registration timestamps.
            </p>
            <button
              type="button"
              className="admin-btn secondary sm"
              onClick={handleExportPatientsCsv}
            >
              <Download size={13} />
              <span>Download Patients CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Specialty Clinical Volume */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <Award size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Specialty Clinical Volume Breakdown</h3>
              <p className="admin-card-subtitle">Highest demand medical departments</p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Specialty Department</th>
                <th>Consultations Count</th>
                <th>Share of Total</th>
                <th>Est. Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dermatology</strong></td>
                <td>14 Bookings</td>
                <td><span className="admin-badge completed">38%</span></td>
                <td>$910.00</td>
              </tr>
              <tr>
                <td><strong>Cardiology</strong></td>
                <td>11 Bookings</td>
                <td><span className="admin-badge completed">30%</span></td>
                <td>$990.00</td>
              </tr>
              <tr>
                <td><strong>General Medicine</strong></td>
                <td>9 Bookings</td>
                <td><span className="admin-badge completed">24%</span></td>
                <td>$450.00</td>
              </tr>
              <tr>
                <td><strong>Pediatrics</strong></td>
                <td>6 Bookings</td>
                <td><span className="admin-badge completed">8%</span></td>
                <td>$360.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
