import React from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Stethoscope,
  Activity
} from 'lucide-react';
import './AdminPages.css';

const AdminDashboardOverview = ({ stats, onNavigateTab, onApproveDoctor, onRejectDoctor }) => {
  const summary = stats?.summary || {
    total_patients: 4,
    total_doctors: 6,
    pending_approvals: 2,
    total_appointments: 5,
    upcoming_appointments: 2,
    completed_appointments: 2,
    cancelled_appointments: 1,
    total_revenue: '325.00'
  };

  const recentPending = stats?.recent_pending_doctors || [];
  const recentAppointments = stats?.recent_appointments || [];
  const trends = stats?.charts?.appointment_trends || [];

  return (
    <div className="admin-overview-view">
      {/* Pending Doctor Priority Action Alert */}
      {summary.pending_approvals > 0 && (
        <div className="admin-priority-alert">
          <div className="priority-alert-left">
            <div className="priority-alert-icon">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="priority-alert-title">
                {summary.pending_approvals} Doctor Registration{summary.pending_approvals > 1 ? 's' : ''} Awaiting Clinical Verification
              </h4>
              <p className="priority-alert-desc">
                Review submitted medical license numbers, specialties, and credentials before approving clinical consultations.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="admin-btn primary"
            onClick={() => onNavigateTab('doctors')}
          >
            <span>Review Applications</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon teal">
            <Users size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{summary.total_patients}</h3>
            <p className="admin-metric-label">Registered Patients</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon blue">
            <Stethoscope size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{summary.total_doctors}</h3>
            <p className="admin-metric-label">Total Doctors ({summary.approved_doctors || 4} Verified)</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon amber">
            <Clock size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{summary.pending_approvals}</h3>
            <p className="admin-metric-label">Pending Verifications</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon purple">
            <Calendar size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">{summary.total_appointments}</h3>
            <p className="admin-metric-label">Total Consultations</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon emerald">
            <DollarSign size={22} />
          </div>
          <div className="admin-metric-info">
            <h3 className="admin-metric-value">${summary.total_revenue}</h3>
            <p className="admin-metric-label">Platform Volume</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="admin-charts-grid">
        {/* Weekly Trend Visualizer */}
        <div className="admin-card">
          <div className="admin-card-header-row">
            <div className="admin-card-title-group">
              <TrendingUp size={18} color="#087F72" />
              <div>
                <h3 className="admin-card-title">Activity Trends (Last 7 Days)</h3>
                <p className="admin-card-subtitle">Consultation bookings vs new patient registrations</p>
              </div>
            </div>
            <button 
              type="button" 
              className="admin-btn secondary sm"
              onClick={() => onNavigateTab('reports')}
            >
              View Analytics
            </button>
          </div>

          <div className="admin-chart-wrap">
            {trends.map((item, idx) => {
              const maxVal = 10;
              const aptHeight = `${(item.appointments / maxVal) * 120}px`;
              const regHeight = `${(item.registrations / maxVal) * 120}px`;

              return (
                <div key={idx} className="chart-bar-col">
                  <div className="chart-bars-group">
                    <div className="bar-apt" style={{ height: aptHeight }} title={`Appointments: ${item.appointments}`} />
                    <div className="bar-reg" style={{ height: regHeight }} title={`Registrations: ${item.registrations}`} />
                  </div>
                  <span className="chart-label">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#087F72' }} />
              <span>Appointments</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#3B82F6' }} />
              <span>New Patients</span>
            </div>
          </div>
        </div>

        {/* Appointment Status Distribution */}
        <div className="admin-card">
          <div className="admin-card-header-row">
            <div className="admin-card-title-group">
              <Activity size={18} color="#087F72" />
              <div>
                <h3 className="admin-card-title">Status Breakdown</h3>
                <p className="admin-card-subtitle">Clinical appointments distribution</p>
              </div>
            </div>
          </div>

          <div className="admin-progress-list">
            <div className="progress-item">
              <div className="progress-header">
                <span className="progress-label">Scheduled / Upcoming</span>
                <span className="progress-value">{summary.upcoming_appointments} ({Math.round((summary.upcoming_appointments / (summary.total_appointments || 1)) * 100)}%)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.round((summary.upcoming_appointments / (summary.total_appointments || 1)) * 100)}%`, background: '#087F72' }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span className="progress-label">Completed Consultations</span>
                <span className="progress-value">{summary.completed_appointments} ({Math.round((summary.completed_appointments / (summary.total_appointments || 1)) * 100)}%)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.round((summary.completed_appointments / (summary.total_appointments || 1)) * 100)}%`, background: '#10B981' }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span className="progress-label">Cancelled / Rescheduled</span>
                <span className="progress-value">{summary.cancelled_appointments} ({Math.round((summary.cancelled_appointments / (summary.total_appointments || 1)) * 100)}%)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.round((summary.cancelled_appointments / (summary.total_appointments || 1)) * 100)}%`, background: '#EF4444' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Doctor Applications Quick List */}
      {recentPending.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header-row">
            <div className="admin-card-title-group">
              <UserCheck size={18} color="#D97706" />
              <div>
                <h3 className="admin-card-title">Pending Doctor Verification Requests</h3>
                <p className="admin-card-subtitle">Review and verify practitioner credentials</p>
              </div>
            </div>
            <button 
              type="button" 
              className="admin-btn secondary sm"
              onClick={() => onNavigateTab('doctors')}
            >
              View All Doctors
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>License Number</th>
                  <th>Applied On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPending.map(doc => (
                  <tr key={doc.doctor_id}>
                    <td style={{ fontWeight: 600 }}>Dr. {doc.first_name} {doc.last_name}</td>
                    <td style={{ color: '#64748B' }}>{doc.email}</td>
                    <td><span className="admin-badge scheduled">{doc.specialization}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{doc.medical_license_number}</td>
                    <td style={{ color: '#64748B' }}>{doc.created_at?.split('T')[0] || 'Recently'}</td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-btn success sm"
                          onClick={() => onApproveDoctor(doc.doctor_id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="admin-btn danger sm"
                          onClick={() => onRejectDoctor(doc)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Appointments Monitoring */}
      <div className="admin-card">
        <div className="admin-card-header-row">
          <div className="admin-card-title-group">
            <Calendar size={18} color="#087F72" />
            <div>
              <h3 className="admin-card-title">Recent Appointments</h3>
              <p className="admin-card-subtitle">Platform-wide patient booking activity</p>
            </div>
          </div>
          <button 
            type="button" 
            className="admin-btn secondary sm"
            onClick={() => onNavigateTab('appointments')}
          >
            Manage Appointments
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map(apt => (
                <tr key={apt.appointment_id}>
                  <td style={{ fontWeight: 600 }}>#{apt.appointment_id}</td>
                  <td>{apt.patient_name}</td>
                  <td>{apt.doctor_name}</td>
                  <td>{apt.specialization}</td>
                  <td>{new Date(apt.appointment_datetime).toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge ${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${apt.payment_status?.toLowerCase() || 'completed'}`}>
                      ${apt.payment_amount || '65.00'} • {apt.payment_status || 'PAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
