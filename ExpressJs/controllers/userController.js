import dbPool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware.js';
import { mockDoctors } from './adminController.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  const cleanEmail = (email || '').trim().toLowerCase();
  let role = 'PATIENT';
  if (cleanEmail.includes('doctor') || cleanEmail.includes('dr.')) role = 'DOCTOR';
  if (cleanEmail.includes('admin')) role = 'ADMIN';

  // Strict check: Prevent unapproved or pending doctors from logging in
  if (role === 'DOCTOR') {
    let doctorRecord = null;

    if (dbPool) {
      try {
        const [rows] = await dbPool.query(`
          SELECT d.*, u.email, u.account_status as user_account_status
          FROM doctors d
          JOIN users u ON d.user_id = u.user_id
          WHERE LOWER(u.email) = ?
        `, [cleanEmail]);
        if (rows && rows.length > 0) {
          doctorRecord = rows[0];
        }
      } catch (err) {
        console.warn('MySQL doctor login lookup fallback:', err.message);
      }
    }

    if (!doctorRecord) {
      doctorRecord = mockDoctors.find(d => 
        (d.email && d.email.toLowerCase() === cleanEmail) ||
        (d.first_name && cleanEmail.includes(d.first_name.toLowerCase()))
      );
    }

    if (doctorRecord) {
      if (doctorRecord.approval_status === 'PENDING') {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: Your doctor account registration is currently PENDING clinical approval by HealPoint administrators. You will be able to log in once your medical license has been verified.'
        });
      }
      if (doctorRecord.approval_status === 'REJECTED') {
        return res.status(403).json({
          success: false,
          message: `Application Rejected: Your doctor registration was not approved. Reason: ${doctorRecord.rejection_reason || 'Medical credentials did not meet clinical verification criteria.'}`
        });
      }
      if (doctorRecord.approval_status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Account Suspended: Your doctor account has been suspended by clinic administrators. Please contact clinical support.'
        });
      }
    } else {
      // If email indicates a new/unverified doctor
      if (cleanEmail.includes('pending') || cleanEmail.includes('priya') || cleanEmail.includes('vikram')) {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: Your doctor account is pending clinical approval by administrators before access is granted.'
        });
      }
    }
  }

  const user = {
    user_id: 1,
    email: cleanEmail || 'patient@healpoint.com',
    role: role,
    first_name: role === 'DOCTOR' ? 'Rahul' : (role === 'ADMIN' ? 'System' : 'Alex'),
    last_name: role === 'DOCTOR' ? 'Sharma' : (role === 'ADMIN' ? 'Admin' : 'Morgan')
  };

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user
  });
};

export const registerPatient = async (req, res) => {
  const user = {
    user_id: Math.floor(100 + Math.random() * 900),
    email: req.body.email,
    role: 'PATIENT',
    account_status: 'ACTIVE',
    ...req.body
  };
  res.status(201).json({ message: 'Patient registered successfully', user });
};

export const registerDoctor = async (req, res) => {
  const { first_name, last_name, email, specialization, medical_license_number, consultation_fee, bio } = req.body;
  const newDoctorId = 100 + Math.floor(Math.random() * 900);
  const newUserId = 200 + Math.floor(Math.random() * 900);

  const newDoctor = {
    doctor_id: newDoctorId,
    user_id: newUserId,
    first_name: first_name || 'Dr.',
    last_name: last_name || 'Specialist',
    email: email,
    specialization: specialization || 'General Medicine',
    bio: bio || 'Practicing healthcare provider dedicated to quality clinical care.',
    location: req.body.location || 'HealPoint Health Clinic',
    consultation_fee: Number(consultation_fee) || 80.00,
    medical_license_number: medical_license_number || `MED-${Date.now().toString().slice(-6)}`,
    qualifications: req.body.qualifications || 'MBBS, MD',
    experience_years: Number(req.body.experience_years) || 5,
    approval_status: 'PENDING',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString()
  };

  mockDoctors.unshift(newDoctor);

  if (dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO users (user_id, email, password_hash, role, account_status)
        VALUES (?, ?, ?, 'DOCTOR', 'PENDING')
      `, [newUserId, email, '$2b$10$demoDoctorHash...']);
      await dbPool.query(`
        INSERT INTO doctors (doctor_id, user_id, first_name, last_name, bio, location, consultation_fee, approval_status, medical_license_number, specialization)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
      `, [newDoctorId, newUserId, first_name, last_name, bio, newDoctor.location, newDoctor.consultation_fee, newDoctor.medical_license_number, specialization]);
    } catch (dbErr) {
      console.warn('MySQL doctor register fallback:', dbErr.message);
    }
  }

  res.status(201).json({ 
    success: true,
    message: 'Doctor registration submitted for clinical verification. Your account is pending administrator approval before login is enabled.', 
    user: newDoctor 
  });
};

