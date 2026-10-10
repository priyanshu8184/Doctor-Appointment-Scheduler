import dbPool from '../config/db.js';
import { mockAuditLogs, mockAdminUsers } from '../data/adminMockStore.js';

export const recordAuditLog = async (adminId, action, targetEntity, targetId, details, req) => {
  const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
  const admin = mockAdminUsers.find(u => u.user_id === Number(adminId)) || { first_name: 'Admin', last_name: 'User' };
  const adminName = `${admin.first_name} ${admin.last_name}`.trim();
  const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

  const newLog = {
    log_id: mockAuditLogs.length + 1,
    admin_id: Number(adminId) || 1,
    admin_name: adminName,
    action,
    target_entity: targetEntity,
    target_id: targetId ? Number(targetId) : null,
    details: detailsStr,
    ip_address: ipAddress,
    created_at: new Date().toISOString()
  };

  mockAuditLogs.unshift(newLog);

  if (dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO audit_logs (admin_id, action, target_entity, target_id, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [newLog.admin_id, newLog.action, newLog.target_entity, newLog.target_id, newLog.details, newLog.ip_address]);
    } catch (err) {
      console.warn('MySQL audit logging fallback:', err.message);
    }
  }

  return newLog;
};
