import { mockDoctors, mockPatients, mockAppointments, mockAuditLogs } from '../../data/adminMockStore.js';

export const getAdminDashboardStats = async (req, res) => {
  const totalDoctors = mockDoctors.length;
  const pendingDoctors = mockDoctors.filter(d => d.approval_status === 'PENDING').length;
  const approvedDoctors = mockDoctors.filter(d => d.approval_status === 'APPROVED').length;
  const suspendedDoctors = mockDoctors.filter(d => d.approval_status === 'SUSPENDED').length;

  const totalPatients = mockPatients.length;
  const activePatients = mockPatients.filter(p => p.account_status === 'ACTIVE').length;

  const totalAppointments = mockAppointments.length;
  const scheduledAppointments = mockAppointments.filter(a => a.status === 'SCHEDULED').length;
  const acceptedAppointments = mockAppointments.filter(a => a.status === 'ACCEPTED').length;
  const completedAppointments = mockAppointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledAppointments = mockAppointments.filter(a => a.status === 'CANCELLED').length;

  const totalRevenue = mockAppointments
    .filter(a => a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (Number(a.payment_amount) || 65.00), 0);

  const summary = {
    total_doctors: totalDoctors,
    pending_doctors: pendingDoctors,
    approved_doctors: approvedDoctors,
    suspended_doctors: suspendedDoctors,
    total_patients: totalPatients,
    active_patients: activePatients,
    total_appointments: totalAppointments,
    scheduled_appointments: scheduledAppointments,
    accepted_appointments: acceptedAppointments,
    completed_appointments: completedAppointments,
    cancelled_appointments: cancelledAppointments,
    total_revenue: totalRevenue
  };

  const charts = {
    weekly_appointments: [
      { day: 'Mon', count: 12 },
      { day: 'Tue', count: 18 },
      { day: 'Wed', count: 15 },
      { day: 'Thu', count: 22 },
      { day: 'Fri', count: 20 },
      { day: 'Sat', count: 8 },
      { day: 'Sun', count: 5 }
    ],
    specialty_distribution: [
      { name: 'General Medicine', value: 40 },
      { name: 'Dermatology', value: 25 },
      { name: 'Cardiology', value: 20 },
      { name: 'Neurology', value: 15 }
    ]
  };

  return res.json({
    success: true,
    summary,
    charts,
    stats: {
      doctors: {
        total: totalDoctors,
        pending: pendingDoctors,
        approved: approvedDoctors,
        suspended: suspendedDoctors
      },
      patients: {
        total: totalPatients,
        active: activePatients
      },
      appointments: {
        total: totalAppointments,
        scheduled: scheduledAppointments,
        accepted: acceptedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      revenue: {
        totalEstimated: totalRevenue,
        currency: 'USD'
      }
    }
  });
};

export const getAdminReports = async (req, res) => {
  const { period = 'month' } = req.query;

  const specialtyCounts = {};
  mockDoctors.forEach(d => {
    const spec = d.specialization || 'General Medicine';
    specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
  });

  const appointmentsByStatus = {
    SCHEDULED: mockAppointments.filter(a => a.status === 'SCHEDULED').length,
    ACCEPTED: mockAppointments.filter(a => a.status === 'ACCEPTED').length,
    COMPLETED: mockAppointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: mockAppointments.filter(a => a.status === 'CANCELLED').length
  };

  return res.json({
    success: true,
    period,
    reports: {
      specialtyBreakdown: specialtyCounts,
      appointmentDistribution: appointmentsByStatus,
      totalRevenue: mockAppointments.filter(a => a.status === 'COMPLETED').length * 75.00,
      totalVolume: mockAppointments.length
    }
  });
};

export const exportDataCsv = async (req, res) => {
  const type = req.params?.type || req.query?.type || 'appointments';

  if (type === 'doctors') {
    const headers = ['Doctor ID', 'Name', 'Email', 'Specialty', 'License', 'Approval Status', 'Consultation Fee', 'Registered Date'];
    const rows = mockDoctors.map(d => [
      d.doctor_id,
      `"Dr. ${d.first_name} ${d.last_name}"`,
      d.email,
      `"${d.specialization}"`,
      d.medical_license_number,
      d.approval_status,
      `$${d.consultation_fee}`,
      d.created_at?.split('T')[0]
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="healpoint_doctors_report.csv"');
    return res.send(csvContent);
  }

  if (type === 'patients') {
    const headers = ['Patient ID', 'Name', 'Email', 'Phone', 'Gender', 'Blood Group', 'Status', 'Registration Date'];
    const rows = mockPatients.map(p => [
      p.patient_id,
      `"${p.first_name} ${p.last_name}"`,
      p.email,
      `"${p.phone_number}"`,
      p.gender,
      p.blood_group,
      p.account_status,
      p.created_at?.split('T')[0]
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="healpoint_patients_report.csv"');
    return res.send(csvContent);
  }

  // Default: Appointments CSV
  const headers = ['Appointment ID', 'Patient Name', 'Doctor Name', 'Specialty', 'Date & Time', 'Status', 'Type', 'Payment Status', 'Fee'];
  const rows = mockAppointments.map(a => [
    a.appointment_id,
    `"${a.patient_name}"`,
    `"${a.doctor_name}"`,
    `"${a.specialization}"`,
    `"${a.appointment_datetime}"`,
    a.status,
    a.appointment_type,
    a.payment_status,
    `$${a.payment_amount}`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="healpoint_appointments_report.csv"');
  return res.send(csvContent);
};

export const getAdminAuditLogs = async (req, res) => {
  const { page = 1, limit = 25 } = req.query;

  const total = mockAuditLogs.length;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = mockAuditLogs.slice(startIndex, startIndex + Number(limit));

  return res.json({
    success: true,
    total,
    page: Number(page),
    limit: Number(limit),
    logs: paginated
  });
};
