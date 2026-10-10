import dbPool from '../config/db.js';

let inMemoryAppointments = [
  {
    appointment_id: 101,
    patient_id: 1,
    patient_name: 'Demo Patient',
    doctor_id: 101,
    doctor_name: 'Dr. Rahul Sharma',
    specialization: 'Dermatology',
    appointment_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'VIDEO',
    telemedicine_url: '/consultation/room_101',
    payment_status: 'COMPLETED',
    payment_amount: 65.00
  },
  {
    appointment_id: 102,
    patient_id: 2,
    patient_name: 'Sarah Jenkins',
    doctor_id: 102,
    doctor_name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    appointment_datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'IN_PERSON',
    telemedicine_url: null,
    payment_status: 'COMPLETED',
    payment_amount: 90.00
  }
];

export const getAppointments = async (req, res) => {
  const user = req.user;
  let filtered = [...inMemoryAppointments];

  // Role-based appointment privacy enforcement
  if (user && user.role === 'DOCTOR') {
    filtered = filtered.filter(a => a.doctor_id === user.user_id || (user.first_name && a.doctor_name?.toLowerCase().includes(user.first_name.toLowerCase())));
  } else if (user && user.role === 'PATIENT') {
    filtered = filtered.filter(a => a.patient_id === user.user_id);
  }

  res.json({ appointments: filtered });
};

export const createAppointment = async (req, res) => {
  const user = req.user;

  // Strict check: Doctors cannot book patient appointments using doctor clinical accounts
  if (user && user.role === 'DOCTOR') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Doctors cannot book appointments as a patient using clinical doctor credentials.'
    });
  }

  const newApt = {
    appointment_id: Math.floor(1000 + Math.random() * 9000),
    patient_id: req.body.patient_id || user?.user_id || 1,
    patient_name: req.body.patient_name || `${user?.first_name || 'Demo'} ${user?.last_name || 'Patient'}`,
    doctor_id: Number(req.body.doctor_id) || 101,
    doctor_name: req.body.doctor_name || 'Dr. Rahul Sharma',
    specialization: req.body.specialization || 'General Medicine',
    appointment_datetime: req.body.appointment_datetime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: req.body.appointment_type || 'VIDEO',
    telemedicine_url: `/consultation/room_${Date.now()}`,
    payment_status: 'COMPLETED',
    payment_amount: req.body.payment_amount || 65.00
  };

  inMemoryAppointments.unshift(newApt);

  if (dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, status, telemedicine_url)
        VALUES (?, ?, ?, 'SCHEDULED', ?)
      `, [newApt.patient_id, newApt.doctor_id, newApt.appointment_datetime, newApt.telemedicine_url]);
    } catch (dbErr) {
      console.warn('MySQL appointment creation fallback:', dbErr.message);
    }
  }

  res.status(201).json({ message: 'Appointment created successfully', appointment: newApt });
};

export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, cancellation_reason } = req.body;
  const apt = inMemoryAppointments.find(a => a.appointment_id === Number(id));

  if (!apt) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  apt.status = status;
  if (cancellation_reason) {
    apt.cancellation_reason = cancellation_reason;
  }

  if (dbPool) {
    try {
      await dbPool.query(`
        UPDATE appointments 
        SET status = ?, cancellation_reason = ?
        WHERE appointment_id = ?
      `, [status, cancellation_reason || null, id]);
    } catch (dbErr) {
      console.warn('MySQL appointment update fallback:', dbErr.message);
    }
  }

  res.json({ message: 'Appointment updated', appointment: apt });
};
