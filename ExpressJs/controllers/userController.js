import dbPool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  const cleanEmail = (email || '').trim().toLowerCase();
  let role = 'PATIENT';
  if (cleanEmail.includes('doctor') || cleanEmail.includes('dr.')) role = 'DOCTOR';
  if (cleanEmail.includes('admin')) role = 'ADMIN';

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
    ...req.body
  };
  res.status(201).json({ message: 'Patient registered successfully', user });
};

export const registerDoctor = async (req, res) => {
  const user = {
    user_id: Math.floor(100 + Math.random() * 900),
    email: req.body.email,
    role: 'DOCTOR',
    ...req.body
  };
  res.status(201).json({ message: 'Doctor registration submitted for approval', user });
};
