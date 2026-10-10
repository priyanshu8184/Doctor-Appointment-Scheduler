import { SAMPLE_DOCTORS } from '../../AI/tools/aiTools.js';

export let mockAdminUsers = [
  {
    user_id: 1,
    email: 'admin@healpoint.com',
    // Hash for 'Admin@12345'
    password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'ADMIN',
    first_name: 'System',
    last_name: 'Administrator',
    account_status: 'ACTIVE',
    created_at: new Date('2026-01-01').toISOString()
  }
];

export let mockDoctors = SAMPLE_DOCTORS.map((d, index) => ({
  doctor_id: d.doctor_id || 101 + index,
  user_id: 200 + index,
  first_name: d.name ? d.name.replace('Dr. ', '').split(' ')[0] : 'Priya',
  last_name: d.name ? (d.name.replace('Dr. ', '').split(' ')[1] || 'Nair') : 'Nair',
  email: `${(d.name || 'doctor').toLowerCase().replace(/[^a-z]/g, '')}@healpoint.com`,
  specialization: d.specialty || d.specialties?.[0] || 'General Medicine',
  bio: d.bio || 'Experienced board-certified healthcare specialist dedicated to patient outcomes.',
  location: d.location || 'HealPoint Health Clinic',
  consultation_fee: d.consultation_fee || d.fee || 75.00,
  medical_license_number: `MED-LIC-${202400 + index}`,
  qualifications: d.qualifications || 'MBBS, MD',
  experience_years: d.experience_years || 8 + (index * 2),
  approval_status: index === 3 ? 'PENDING' : (index === 4 ? 'SUSPENDED' : 'APPROVED'),
  rejection_reason: null,
  reviewed_by: index === 3 ? null : 1,
  reviewed_at: index === 3 ? null : new Date('2026-02-15').toISOString(),
  created_at: new Date(Date.now() - (30 - index * 5) * 24 * 3600 * 1000).toISOString()
}));

// Additional pending doctor application for demo review
mockDoctors.push({
  doctor_id: 108,
  user_id: 208,
  first_name: 'Vikram',
  last_name: 'Mehta',
  email: 'vikram.mehta@healpoint.com',
  specialization: 'Neurology',
  bio: 'Specialist in neurological disorders, stroke rehabilitation, and migraine management.',
  location: 'HealPoint Neuro Institute',
  consultation_fee: 120.00,
  medical_license_number: 'MED-LIC-202688',
  qualifications: 'MBBS, DM (Neurology), FAAN',
  experience_years: 12,
  approval_status: 'PENDING',
  rejection_reason: null,
  reviewed_by: null,
  reviewed_at: null,
  created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
});

export let mockPatients = [
  {
    patient_id: 1,
    user_id: 10,
    first_name: 'Demo',
    last_name: 'Patient',
    email: 'demo.patient@healpoint.com',
    phone_number: '+1 (555) 019-2834',
    date_of_birth: '1994-08-12',
    gender: 'Male',
    blood_group: 'O+',
    account_status: 'ACTIVE',
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    patient_id: 2,
    user_id: 11,
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.jenkins@example.com',
    phone_number: '+1 (555) 432-8765',
    date_of_birth: '1988-03-22',
    gender: 'Female',
    blood_group: 'A+',
    account_status: 'ACTIVE',
    created_at: new Date('2026-02-05').toISOString()
  },
  {
    patient_id: 3,
    user_id: 12,
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    phone_number: '+1 (555) 789-0123',
    date_of_birth: '1975-11-14',
    gender: 'Male',
    blood_group: 'B+',
    account_status: 'ACTIVE',
    created_at: new Date('2026-02-20').toISOString()
  },
  {
    patient_id: 4,
    user_id: 13,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@example.com',
    phone_number: '+1 (555) 321-6549',
    date_of_birth: '1998-07-30',
    gender: 'Female',
    blood_group: 'AB-',
    account_status: 'SUSPENDED',
    created_at: new Date('2026-03-01').toISOString()
  }
];

export let mockAppointments = [
  {
    appointment_id: 101,
    patient_id: 1,
    patient_name: 'Demo Patient',
    doctor_id: 101,
    doctor_name: 'Dr. Priya Nair',
    specialization: 'General Medicine',
    appointment_datetime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'VIDEO',
    cancellation_reason: null,
    telemedicine_url: '/consultation/room_101',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 102,
    patient_id: 2,
    patient_name: 'Sarah Jenkins',
    doctor_id: 102,
    doctor_name: 'Dr. Rahul Sharma',
    specialization: 'Dermatology',
    appointment_datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'IN_PERSON',
    cancellation_reason: null,
    telemedicine_url: null,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 103,
    patient_id: 3,
    patient_name: 'Michael Chen',
    doctor_id: 103,
    doctor_name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    appointment_datetime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    status: 'ACCEPTED',
    appointment_type: 'VIDEO',
    cancellation_reason: null,
    telemedicine_url: '/consultation/room_103',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 104,
    patient_id: 4,
    patient_name: 'Emily Davis',
    doctor_id: 104,
    doctor_name: 'Dr. Amit Patel',
    specialization: 'Orthopedics',
    appointment_datetime: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    status: 'CANCELLED',
    appointment_type: 'IN_PERSON',
    cancellation_reason: 'Patient experienced scheduling conflict and requested full refund.',
    telemedicine_url: null,
    created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  }
];

export let mockAuditLogs = [
  {
    log_id: 1,
    admin_id: 1,
    admin_name: 'System Administrator',
    action: 'ADMIN_LOGIN',
    target_entity: 'AUTH',
    target_id: 1,
    details: JSON.stringify({ ip: '127.0.0.1', message: 'Initial administrative login' }),
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    log_id: 2,
    admin_id: 1,
    admin_name: 'System Administrator',
    action: 'DOCTOR_APPROVAL',
    target_entity: 'DOCTOR',
    target_id: 101,
    details: JSON.stringify({ doctor_name: 'Dr. Priya Nair', status: 'APPROVED' }),
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];
