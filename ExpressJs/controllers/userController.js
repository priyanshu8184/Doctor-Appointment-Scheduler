import dbPool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware.js';
import { mockDoctors } from './adminController.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  const cleanEmail = (email || '').trim().toLowerCase();
  
  if (!cleanEmail) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  let role = 'PATIENT';
  let doctorRecord = null;
  let userRecord = null;

  // 1. Check MySQL Database for User & Doctor Record
  if (dbPool) {
    try {
      const [rows] = await dbPool.query(`
        SELECT u.user_id, u.email, u.role, u.password_hash, u.account_status as user_account_status,
               d.doctor_id, d.first_name, d.last_name, d.approval_status, d.specialization, d.medical_license_number, d.rejection_reason
        FROM users u
        LEFT JOIN doctors d ON u.user_id = d.user_id
        WHERE LOWER(u.email) = ?
      `, [cleanEmail]);

      if (rows && rows.length > 0) {
        userRecord = rows[0];
        role = userRecord.role;
        if (role === 'DOCTOR' || userRecord.doctor_id) {
          doctorRecord = userRecord;
          role = 'DOCTOR';
        }
      }
    } catch (err) {
      console.warn('MySQL user login lookup fallback:', err.message);
    }
  }

  // 2. Check In-Memory Doctor Store if not found in DB
  if (!doctorRecord) {
    doctorRecord = mockDoctors.find(d => 
      (d.email && d.email.toLowerCase() === cleanEmail) ||
      (d.first_name && cleanEmail.includes(d.first_name.toLowerCase()))
    );
    if (doctorRecord) {
      role = 'DOCTOR';
    }
  }

  // 3. Check for Admin Email
  if (cleanEmail === 'admin@healpoint.com' || cleanEmail.includes('admin')) {
    role = 'ADMIN';
  }

  // 4. Strict Doctor Verification & Approval Enforcement
  if (role === 'DOCTOR' && doctorRecord) {
    const docName = `Dr. ${doctorRecord.first_name} ${doctorRecord.last_name}`.trim();
    
    if (doctorRecord.approval_status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: `Access Restricted: Your doctor account registration (${docName}) is currently PENDING clinical approval by HealPoint administrators. You will be able to log in as soon as an administrator verifies your medical license.`
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
        message: `Account Suspended: Your doctor account has been suspended by clinic administrators. Please contact clinical support.`
      });
    }
  }

  // 5. Construct User Object
  const user = {
    user_id: doctorRecord?.doctor_id || doctorRecord?.user_id || userRecord?.user_id || 1,
    email: cleanEmail,
    role: role,
    first_name: doctorRecord?.first_name || (role === 'DOCTOR' ? 'Doctor' : (role === 'ADMIN' ? 'System' : 'Alex')),
    last_name: doctorRecord?.last_name || (role === 'DOCTOR' ? 'Specialist' : (role === 'ADMIN' ? 'Administrator' : 'Morgan')),
    specialization: doctorRecord?.specialization || (role === 'DOCTOR' ? 'General Medicine' : null),
    approval_status: doctorRecord?.approval_status || 'ACTIVE'
  };

  const token = jwt.sign(
    { 
      user_id: user.user_id, 
      email: user.email, 
      role: user.role, 
      first_name: user.first_name, 
      last_name: user.last_name,
      specialization: user.specialization
    },
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
    email: (req.body.email || '').trim().toLowerCase(),
    role: 'PATIENT',
    first_name: req.body.firstName || req.body.first_name || 'Patient',
    last_name: req.body.lastName || req.body.last_name || 'User',
    account_status: 'ACTIVE',
    ...req.body
  };
  res.status(201).json({ message: 'Patient registered successfully', user });
};

export const registerDoctor = async (req, res) => {
  const { 
    firstName, 
    first_name, 
    lastName, 
    last_name, 
    email, 
    specialization, 
    medicalLicenseNumber, 
    medical_license_number, 
    consultationFee, 
    consultation_fee, 
    bio,
    education,
    experience,
    doctorPhone,
    phone_number
  } = req.body;

  const fName = (firstName || first_name || 'Dr.').trim();
  const lName = (lastName || last_name || 'Specialist').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const newDoctorId = 100 + Math.floor(Math.random() * 900);
  const newUserId = 200 + Math.floor(Math.random() * 900);

  const newDoctor = {
    doctor_id: newDoctorId,
    user_id: newUserId,
    first_name: fName,
    last_name: lName,
    email: cleanEmail,
    specialization: specialization || 'General Medicine',
    bio: bio || 'Practicing healthcare provider dedicated to quality clinical care.',
    location: req.body.location || 'HealPoint Health Clinic',
    consultation_fee: Number(consultationFee || consultation_fee) || 80.00,
    medical_license_number: medicalLicenseNumber || medical_license_number || `MED-${Date.now().toString().slice(-6)}`,
    qualifications: education || req.body.qualifications || 'MBBS, MD',
    experience_years: Number(experience || req.body.experience_years) || 5,
    phone_number: doctorPhone || phone_number || '+1 (555) 019-3482',
    approval_status: 'PENDING',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString()
  };

  // Prepend to in-memory store
  const existingIdx = mockDoctors.findIndex(d => d.email && d.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    mockDoctors[existingIdx] = newDoctor;
  } else {
    mockDoctors.unshift(newDoctor);
  }

  if (dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO users (user_id, email, password_hash, role, account_status)
        VALUES (?, ?, ?, 'DOCTOR', 'PENDING')
        ON DUPLICATE KEY UPDATE role = 'DOCTOR', account_status = 'PENDING'
      `, [newUserId, cleanEmail, '$2b$10$demoDoctorHash...']);
      
      await dbPool.query(`
        INSERT INTO doctors (doctor_id, user_id, first_name, last_name, bio, location, consultation_fee, approval_status, medical_license_number, specialization)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
        ON DUPLICATE KEY UPDATE approval_status = 'PENDING', medical_license_number = ?
      `, [newDoctorId, newUserId, fName, lName, newDoctor.bio, newDoctor.location, newDoctor.consultation_fee, newDoctor.medical_license_number, newDoctor.specialization, newDoctor.medical_license_number]);
    } catch (dbErr) {
      console.warn('MySQL doctor register fallback:', dbErr.message);
    }
  }

  res.status(201).json({ 
    success: true,
    message: `Doctor registration for Dr. ${fName} ${lName} submitted successfully! Your application is pending clinical verification by administrators before login is enabled.`, 
    user: newDoctor,
    doctor: newDoctor 
  });
};
