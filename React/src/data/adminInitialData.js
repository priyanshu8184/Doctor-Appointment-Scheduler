// Rich default datasets for offline resilience and initial state in Admin Portal
export const INITIAL_DOCTORS = [
  {
    doctor_id: 101,
    user_id: 201,
    first_name: 'Rahul',
    last_name: 'Sharma',
    email: 'rahul.sharma@healpoint.com',
    specialization: 'Dermatology',
    bio: 'Board-certified dermatologist with 10+ years treating complex skin, hair, and nail disorders.',
    location: 'HealPoint Health Clinic, Room 302',
    consultation_fee: 65.00,
    medical_license_number: 'MED-LIC-202401',
    qualifications: 'MBBS, MD (Dermatology)',
    experience_years: 10,
    approval_status: 'APPROVED',
    rejection_reason: null,
    reviewed_by: 1,
    reviewed_at: '2026-02-10T10:00:00Z',
    created_at: '2026-01-15T09:30:00Z'
  },
  {
    doctor_id: 102,
    user_id: 202,
    first_name: 'Ananya',
    last_name: 'Sen',
    email: 'ananya.sen@healpoint.com',
    specialization: 'Cardiology',
    bio: 'Cardiovascular specialist focused on preventive cardiology and non-invasive diagnostics.',
    location: 'HealPoint Heart Center, Suite 104',
    consultation_fee: 90.00,
    medical_license_number: 'MED-LIC-202402',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    experience_years: 14,
    approval_status: 'APPROVED',
    rejection_reason: null,
    reviewed_by: 1,
    reviewed_at: '2026-02-12T14:20:00Z',
    created_at: '2026-01-20T11:00:00Z'
  },
  {
    doctor_id: 103,
    user_id: 203,
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@healpoint.com',
    specialization: 'Neurology',
    bio: 'Clinical neurologist specializing in cognitive neurology, neuropathy, and headache disorders.',
    location: 'HealPoint Neurology Center',
    consultation_fee: 95.00,
    medical_license_number: 'MED-LIC-202403',
    qualifications: 'MBBS, MD, FAAN',
    experience_years: 12,
    approval_status: 'APPROVED',
    rejection_reason: null,
    reviewed_by: 1,
    reviewed_at: '2026-02-14T09:00:00Z',
    created_at: '2026-01-25T14:15:00Z'
  },
  {
    doctor_id: 104,
    user_id: 204,
    first_name: 'Priya',
    last_name: 'Nair',
    email: 'priya.nair@healpoint.com',
    specialization: 'Pediatrics',
    bio: 'Dedicated pediatrician with extensive experience in neonatal care, infant development, and childhood wellness.',
    location: 'HealPoint Children Wellness Wing',
    consultation_fee: 70.00,
    medical_license_number: 'MED-LIC-202404',
    qualifications: 'MBBS, DCH, MD (Pediatrics)',
    experience_years: 8,
    approval_status: 'PENDING',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-03-01T08:45:00Z'
  },
  {
    doctor_id: 105,
    user_id: 205,
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@healpoint.com',
    specialization: 'Psychiatry',
    bio: 'Adult and adolescent psychiatry specialist with expertise in mood disorders and psychotherapy.',
    location: 'HealPoint Behavioral Health Center',
    consultation_fee: 85.00,
    medical_license_number: 'MED-LIC-202405',
    qualifications: 'MD, MRCPsych',
    experience_years: 11,
    approval_status: 'SUSPENDED',
    rejection_reason: 'Awaiting annual medical license renewal documentation.',
    reviewed_by: 1,
    reviewed_at: '2026-02-28T16:00:00Z',
    created_at: '2026-02-01T10:30:00Z'
  },
  {
    doctor_id: 108,
    user_id: 208,
    first_name: 'Vikram',
    last_name: 'Mehta',
    email: 'vikram.mehta@healpoint.com',
    specialization: 'Orthopedics',
    bio: 'Consultant orthopedic surgeon specializing in arthroscopy, joint reconstruction, and sports injuries.',
    location: 'HealPoint Orthopedics & Joint Clinic',
    consultation_fee: 110.00,
    medical_license_number: 'MED-LIC-202688',
    qualifications: 'MBBS, MS (Ortho), MCh',
    experience_years: 13,
    approval_status: 'PENDING',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-03-05T11:20:00Z'
  }
];

export const INITIAL_PATIENTS = [
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
    created_at: '2026-01-10T12:00:00Z'
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
    created_at: '2026-02-05T09:15:00Z'
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
    created_at: '2026-02-20T14:30:00Z'
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
    created_at: '2026-03-01T16:45:00Z'
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    appointment_id: 101,
    patient_id: 1,
    patient_name: 'Demo Patient',
    patient_email: 'demo.patient@healpoint.com',
    doctor_id: 101,
    doctor_name: 'Dr. Rahul Sharma',
    specialization: 'Dermatology',
    appointment_datetime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'VIDEO',
    location: 'HealPoint Health Clinic',
    telemedicine_url: '/consultation/room_101',
    payment_status: 'COMPLETED',
    payment_amount: 65.00,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 102,
    patient_id: 2,
    patient_name: 'Sarah Jenkins',
    patient_email: 'sarah.jenkins@example.com',
    doctor_id: 102,
    doctor_name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    appointment_datetime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'IN_PERSON',
    location: 'HealPoint Heart Center, Suite 104',
    telemedicine_url: null,
    payment_status: 'COMPLETED',
    payment_amount: 90.00,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 103,
    patient_id: 3,
    patient_name: 'Michael Chen',
    patient_email: 'michael.chen@example.com',
    doctor_id: 103,
    doctor_name: 'Dr. Marcus Vance',
    specialization: 'Neurology',
    appointment_datetime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'VIDEO',
    location: 'HealPoint Neurology Center',
    telemedicine_url: '/consultation/room_103',
    payment_status: 'COMPLETED',
    payment_amount: 95.00,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 104,
    patient_id: 1,
    patient_name: 'Demo Patient',
    patient_email: 'demo.patient@healpoint.com',
    doctor_id: 102,
    doctor_name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    appointment_datetime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'IN_PERSON',
    location: 'HealPoint Heart Center, Suite 104',
    telemedicine_url: null,
    payment_status: 'COMPLETED',
    payment_amount: 75.00,
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    appointment_id: 105,
    patient_id: 4,
    patient_name: 'Emily Davis',
    patient_email: 'emily.davis@example.com',
    doctor_id: 101,
    doctor_name: 'Dr. Rahul Sharma',
    specialization: 'Dermatology',
    appointment_datetime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'CANCELLED',
    cancellation_reason: 'Patient requested rescheduling due to travel conflict.',
    appointment_type: 'VIDEO',
    location: 'HealPoint Health Clinic',
    telemedicine_url: null,
    payment_status: 'REFUNDED',
    payment_amount: 65.00,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    log_id: 1,
    admin_id: 1,
    admin_email: 'admin@healpoint.com',
    action_type: 'DOCTOR_APPROVAL',
    target_type: 'DOCTOR',
    target_id: 101,
    details: { doctor_name: 'Dr. Rahul Sharma', status: 'APPROVED' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    log_id: 2,
    admin_id: 1,
    admin_email: 'admin@healpoint.com',
    action_type: 'PATIENT_SUSPEND',
    target_type: 'PATIENT',
    target_id: 4,
    details: { patient_name: 'Emily Davis', reason: 'Account security verification review' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

export const getInitialDocs = () => {
  let docs = [];
  try {
    const cached = localStorage.getItem('healpoint_doctors');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) docs = parsed;
    }
  } catch (e) {}

  if (docs.length === 0) {
    docs = [...INITIAL_DOCTORS];
  }

  // Merge in any newly registered doctors from healpoint_registered_users
  try {
    const cachedU = localStorage.getItem('healpoint_registered_users');
    if (cachedU) {
      const usersMap = JSON.parse(cachedU);
      Object.values(usersMap).forEach(u => {
        if (u.role === 'DOCTOR' && u.email) {
          const cleanEmail = u.email.toLowerCase();
          const exists = docs.some(d => d.email && d.email.toLowerCase() === cleanEmail);
          if (!exists) {
            docs.unshift({
              doctor_id: u.doctor_id || Date.now(),
              user_id: u.user_id || Date.now() + 1,
              first_name: u.first_name || 'Sarah',
              last_name: u.last_name || 'Taylor',
              name: `Dr. ${u.first_name || 'Sarah'} ${u.last_name || 'Taylor'}`,
              email: cleanEmail,
              specialization: u.specialization || 'General Medicine',
              medical_license_number: u.medical_license_number || 'MED-LIC-202699',
              consultation_fee: u.consultation_fee || 85.00,
              experience_years: u.experience_years || 7,
              qualifications: u.qualifications || 'MBBS, MD',
              approval_status: u.approval_status || 'PENDING',
              created_at: new Date().toISOString()
            });
          }
        }
      });
    }
  } catch (e) {}

  return docs;
};
