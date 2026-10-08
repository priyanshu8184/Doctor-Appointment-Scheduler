import dbPool from '../config/db.js';

export const getPatientProfile = async (req, res) => {
  const { id } = req.params;
  const samplePatient = {
    patient_id: Number(id) || 1,
    first_name: 'Alex',
    last_name: 'Morgan',
    email: 'patient@healpoint.com',
    phone_number: '+1 (555) 234-5678',
    date_of_birth: '1995-06-15',
    gender: 'Female',
    blood_group: 'O+',
    address: '42 Healthway Blvd, Suite 10',
    emergency_contact: '+1 (555) 987-6543'
  };
  res.json({ patient: samplePatient });
};

export const updatePatientProfile = async (req, res) => {
  res.json({ message: 'Profile updated successfully', patient: req.body });
};
