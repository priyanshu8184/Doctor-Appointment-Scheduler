import dbPool from '../../config/db.js';
import { mockAppointments } from '../../data/adminMockStore.js';
import { recordAuditLog } from '../../services/auditService.js';
import {
  buildAppointmentsPdfStream,
  buildSingleAppointmentPdfStream,
  buildAppointmentsImageSvg,
  buildSingleAppointmentImageSvg
} from '../../services/exportService.js';

export const getFilteredAppointmentsList = (query = {}) => {
  const { search, status, specialty, startDate, endDate } = query;
  let filtered = [...mockAppointments];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(a => a.status === status.toUpperCase());
  }

  if (specialty && specialty !== 'ALL') {
    filtered = filtered.filter(a => a.specialization?.toLowerCase() === specialty.toLowerCase());
  }

  if (startDate) {
    filtered = filtered.filter(a => new Date(a.appointment_datetime) >= new Date(startDate));
  }

  if (endDate) {
    filtered = filtered.filter(a => new Date(a.appointment_datetime) <= new Date(endDate + 'T23:59:59'));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a => 
      String(a.appointment_id).includes(q) ||
      a.patient_name?.toLowerCase().includes(q) ||
      a.doctor_name?.toLowerCase().includes(q) ||
      a.specialization?.toLowerCase().includes(q)
    );
  }

  return filtered;
};

export const getAdminAppointments = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const filtered = getFilteredAppointmentsList(req.query);

  const total = filtered.length;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = filtered.slice(startIndex, startIndex + Number(limit));

  return res.json({
    success: true,
    total,
    page: Number(page),
    limit: Number(limit),
    appointments: paginated
  });
};

export const getAdminAppointmentById = async (req, res) => {
  const { id } = req.params;
  const apt = mockAppointments.find(a => a.appointment_id === Number(id));

  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment record not found.' });
  }

  return res.json({ success: true, appointment: apt });
};

export const updateAdminAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, cancellation_reason } = req.body;
  const adminId = req.user?.user_id || 1;

  const apt = mockAppointments.find(a => a.appointment_id === Number(id));
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  const oldStatus = apt.status;
  apt.status = status.toUpperCase();
  if (cancellation_reason) {
    apt.cancellation_reason = cancellation_reason;
  }

  if (dbPool) {
    try {
      await dbPool.query(`
        UPDATE appointments
        SET status = ?, cancellation_reason = ?
        WHERE appointment_id = ?
      `, [apt.status, cancellation_reason || null, id]);
    } catch (err) {
      console.warn('MySQL appointment status update fallback:', err.message);
    }
  }

  await recordAuditLog(adminId, 'APPOINTMENT_STATUS_UPDATE', 'APPOINTMENT', id, {
    old_status: oldStatus,
    new_status: apt.status,
    reason: cancellation_reason || null
  }, req);

  return res.json({
    success: true,
    message: `Appointment #${id} status updated to ${apt.status}.`,
    appointment: apt
  });
};

export const rescheduleAdminAppointment = async (req, res) => {
  const { id } = req.params;
  const appointment_datetime = req.body?.appointment_datetime || req.body?.new_datetime;
  const notes = req.body?.notes;
  const adminId = req.user?.user_id || 1;

  if (!appointment_datetime) {
    return res.status(400).json({ success: false, message: 'New appointment datetime is required.' });
  }

  const apt = mockAppointments.find(a => a.appointment_id === Number(id));
  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  const oldDatetime = apt.appointment_datetime;
  apt.appointment_datetime = new Date(appointment_datetime).toISOString();
  apt.status = 'SCHEDULED';

  await recordAuditLog(adminId, 'APPOINTMENT_RESCHEDULE', 'APPOINTMENT', id, {
    old_datetime: oldDatetime,
    new_datetime: apt.appointment_datetime,
    notes: notes || null
  }, req);

  return res.json({
    success: true,
    message: `Appointment #${id} successfully rescheduled for ${apt.appointment_datetime}.`,
    appointment: apt
  });
};

export const exportAppointmentsPdf = async (req, res) => {
  try {
    const matching = getFilteredAppointmentsList(req.query);
    const adminUser = req.user || { email: 'admin@healpoint.com' };

    res.setHeader('Content-Type', 'application/pdf');
    const dateTag = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Disposition', `attachment; filename="healpoint_appointments_${dateTag}.pdf"`);

    const doc = buildAppointmentsPdfStream(matching, req.query, adminUser);
    doc.pipe(res);
    doc.end();

    await recordAuditLog(adminUser.user_id, 'APPOINTMENT_EXPORT_PDF', 'APPOINTMENTS_BULK', 0, {
      records_count: matching.length,
      filters: req.query
    }, req);
  } catch (err) {
    console.error('Error generating appointments PDF export:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF report.' });
  }
};

export const exportSingleAppointmentPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const apt = mockAppointments.find(a => a.appointment_id === Number(id));

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const adminUser = req.user || { email: 'admin@healpoint.com' };
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="healpoint_appointment_${id}.pdf"`);

    const doc = buildSingleAppointmentPdfStream(apt, adminUser);
    doc.pipe(res);
    doc.end();

    await recordAuditLog(adminUser.user_id, 'APPOINTMENT_EXPORT_PDF_SINGLE', 'APPOINTMENT', id, {
      appointment_id: Number(id),
      patient_name: apt.patient_name
    }, req);
  } catch (err) {
    console.error('Error generating single appointment PDF:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate appointment PDF.' });
  }
};

export const exportAppointmentsImage = async (req, res) => {
  try {
    const matching = getFilteredAppointmentsList(req.query);
    const adminUser = req.user || { email: 'admin@healpoint.com' };
    const svgContent = buildAppointmentsImageSvg(matching, req.query);

    const dateTag = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="healpoint_appointments_${dateTag}.svg"`);

    await recordAuditLog(adminUser.user_id, 'APPOINTMENT_EXPORT_IMAGE', 'APPOINTMENTS_BULK', 0, {
      records_count: matching.length
    }, req);

    return res.send(svgContent);
  } catch (err) {
    console.error('Error exporting appointments image:', err);
    return res.status(500).json({ success: false, message: 'Failed to export appointments image.' });
  }
};

export const exportSingleAppointmentImage = async (req, res) => {
  try {
    const { id } = req.params;
    const apt = mockAppointments.find(a => a.appointment_id === Number(id));

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const adminUser = req.user || { email: 'admin@healpoint.com' };
    const svgContent = buildSingleAppointmentImageSvg(apt);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="healpoint_appointment_${id}.svg"`);

    await recordAuditLog(adminUser.user_id, 'APPOINTMENT_EXPORT_IMAGE_SINGLE', 'APPOINTMENT', id, {
      appointment_id: Number(id)
    }, req);

    return res.send(svgContent);
  } catch (err) {
    console.error('Error exporting appointment image:', err);
    return res.status(500).json({ success: false, message: 'Failed to export appointment image.' });
  }
};
