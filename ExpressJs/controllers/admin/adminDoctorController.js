import dbPool from '../../config/db.js';
import { mockDoctors } from '../../data/adminMockStore.js';
import { recordAuditLog } from '../../services/auditService.js';

export const getAdminDoctors = async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;

  let filtered = [...mockDoctors];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(d => d.approval_status === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d => 
      `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.medical_license_number?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = filtered.slice(startIndex, startIndex + Number(limit));

  return res.json({
    success: true,
    total,
    page: Number(page),
    limit: Number(limit),
    doctors: paginated
  });
};

export const getAdminDoctorById = async (req, res) => {
  const { id } = req.params;
  const doc = mockDoctors.find(d => d.doctor_id === Number(id));

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Doctor not found in registry.' });
  }

  return res.json({ success: true, doctor: doc });
};

export const approveDoctor = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user?.user_id || 1;

  const doc = mockDoctors.find(d => d.doctor_id === Number(id));
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Doctor record not found.' });
  }

  doc.approval_status = 'APPROVED';
  doc.rejection_reason = null;
  doc.reviewed_by = adminId;
  doc.reviewed_at = new Date().toISOString();

  if (dbPool) {
    try {
      await dbPool.query(`
        UPDATE doctors
        SET approval_status = 'APPROVED', rejection_reason = NULL, reviewed_by = ?, reviewed_at = NOW()
        WHERE doctor_id = ?
      `, [adminId, id]);
    } catch (err) {
      console.warn('MySQL approve doctor fallback:', err.message);
    }
  }

  await recordAuditLog(adminId, 'DOCTOR_APPROVAL', 'DOCTOR', id, {
    doctor_name: `Dr. ${doc.first_name} ${doc.last_name}`,
    action: 'APPROVED'
  }, req);

  return res.json({
    success: true,
    message: `Doctor Dr. ${doc.first_name} ${doc.last_name} has been verified and approved.`,
    doctor: doc
  });
};

export const rejectDoctor = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.user?.user_id || 1;

  const doc = mockDoctors.find(d => d.doctor_id === Number(id));
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Doctor record not found.' });
  }

  doc.approval_status = 'REJECTED';
  doc.rejection_reason = reason || 'Clinical credentials could not be verified.';
  doc.reviewed_by = adminId;
  doc.reviewed_at = new Date().toISOString();

  if (dbPool) {
    try {
      await dbPool.query(`
        UPDATE doctors
        SET approval_status = 'REJECTED', rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
        WHERE doctor_id = ?
      `, [doc.rejection_reason, adminId, id]);
    } catch (err) {
      console.warn('MySQL reject doctor fallback:', err.message);
    }
  }

  await recordAuditLog(adminId, 'DOCTOR_REJECTION', 'DOCTOR', id, {
    doctor_name: `Dr. ${doc.first_name} ${doc.last_name}`,
    reason: doc.rejection_reason
  }, req);

  return res.json({
    success: true,
    message: `Doctor application for Dr. ${doc.first_name} ${doc.last_name} has been rejected.`,
    doctor: doc
  });
};

export const updateDoctorStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const adminId = req.user?.user_id || 1;

  const doc = mockDoctors.find(d => d.doctor_id === Number(id));
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }

  doc.approval_status = status.toUpperCase();
  if (reason) doc.rejection_reason = reason;
  doc.reviewed_by = adminId;
  doc.reviewed_at = new Date().toISOString();

  await recordAuditLog(adminId, 'DOCTOR_STATUS_UPDATE', 'DOCTOR', id, {
    new_status: doc.approval_status,
    reason: reason || null
  }, req);

  return res.json({
    success: true,
    message: `Doctor status updated to ${doc.approval_status}.`,
    doctor: doc
  });
};
