import dbPool from '../config/db.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Basic mock check or DB check
  let role = 'PATIENT';
  if (email.includes('doctor') || email.includes('dr.')) role = 'DOCTOR';
  if (email.includes('admin')) role = 'ADMIN';

  const user = {
    user_id: 1,
    email: email || 'patient@healpoint.com',
    role: role,
    first_name: role === 'DOCTOR' ? 'Rahul' : (role === 'ADMIN' ? 'Admin' : 'Alex'),
    last_name: role === 'DOCTOR' ? 'Sharma' : (role === 'ADMIN' ? 'User' : 'Morgan')
  };

  res.json({
    message: 'Login successful',
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
