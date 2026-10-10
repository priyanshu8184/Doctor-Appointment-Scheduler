import dbPool from '../../config/db.js';
import { mockPatients } from '../../data/adminMockStore.js';
import { recordAuditLog } from '../../services/auditService.js';

export const getAdminPatients = async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;

  let filtered = [...mockPatients];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(p => p.account_status === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => 
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone_number?.includes(q)
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
    patients: paginated
  });
};

export const updatePatientStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const adminId = req.user?.user_id || 1;

  const patient = mockPatients.find(p => p.patient_id === Number(id));
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }

  patient.account_status = status.toUpperCase();

  if (dbPool) {
    try {
      await dbPool.query(`
        UPDATE users
        SET account_status = ?
        WHERE user_id = ?
      `, [patient.account_status, patient.user_id]);
    } catch (err) {
      console.warn('MySQL patient status update fallback:', err.message);
    }
  }

  await recordAuditLog(adminId, 'PATIENT_STATUS_UPDATE', 'PATIENT', id, {
    patient_name: `${patient.first_name} ${patient.last_name}`,
    new_status: patient.account_status,
    reason: reason || null
  }, req);

  return res.json({
    success: true,
    message: `Patient account status updated to ${patient.account_status}.`,
    patient
  });
};
