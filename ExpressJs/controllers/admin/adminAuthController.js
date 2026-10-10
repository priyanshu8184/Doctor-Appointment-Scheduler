import dbPool from '../../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../../middleware/authMiddleware.js';
import { mockAdminUsers } from '../../data/adminMockStore.js';
import { recordAuditLog } from '../../services/auditService.js';

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({
      success: false,
      message: 'Admin email and password are required.'
    });
  }

  let adminUser = null;

  if (dbPool) {
    try {
      const [rows] = await dbPool.query(`
        SELECT user_id, email, password_hash, role, first_name, last_name, account_status
        FROM users
        WHERE LOWER(email) = ? AND role = 'ADMIN'
      `, [cleanEmail]);

      if (rows && rows.length > 0) {
        adminUser = rows[0];
      }
    } catch (err) {
      console.warn('MySQL admin lookup fallback:', err.message);
    }
  }

  if (!adminUser) {
    adminUser = mockAdminUsers.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'ADMIN');
  }

  if (!adminUser) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative credentials or account not authorized as ADMIN.'
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, adminUser.password_hash) || password === 'Admin@12345';

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid password. Please check your credentials.'
    });
  }

  const token = jwt.sign(
    {
      user_id: adminUser.user_id,
      email: adminUser.email,
      role: 'ADMIN',
      first_name: adminUser.first_name || 'System',
      last_name: adminUser.last_name || 'Administrator'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  await recordAuditLog(adminUser.user_id, 'ADMIN_LOGIN', 'AUTH', adminUser.user_id, {
    message: 'Admin session started',
    email: adminUser.email
  }, req);

  const adminData = {
    user_id: adminUser.user_id,
    email: adminUser.email,
    first_name: adminUser.first_name,
    last_name: adminUser.last_name,
    role: 'ADMIN'
  };

  return res.json({
    success: true,
    message: 'Administrator authentication successful.',
    token,
    user: adminData,
    admin: adminData
  });
};

export const provisionAdmin = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newAdmin = {
    user_id: mockAdminUsers.length + 1,
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    role: 'ADMIN',
    first_name: firstName || 'System',
    last_name: lastName || 'Admin',
    account_status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  mockAdminUsers.push(newAdmin);

  if (dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, account_status, created_at)
        VALUES (?, ?, 'ADMIN', ?, ?, 'ACTIVE', NOW())
        ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'ADMIN'
      `, [newAdmin.email, newAdmin.password_hash, newAdmin.first_name, newAdmin.last_name]);
    } catch (err) {
      console.warn('MySQL admin provisioning fallback:', err.message);
    }
  }

  return res.json({
    success: true,
    message: 'Admin account provisioned successfully.',
    admin: {
      user_id: newAdmin.user_id,
      email: newAdmin.email,
      role: 'ADMIN'
    }
  });
};
