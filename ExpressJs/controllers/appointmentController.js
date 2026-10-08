import dbPool from '../config/db.js';

let inMemoryAppointments = [
  {
    appointment_id: 101,
    patient_id: 1,
    doctor_id: 101,
    appointment_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: 'VIDEO',
    telemedicine_url: '/consultation/room_101'
  },
  {
    appointment_id: 102,
    patient_id: 1,
    doctor_id: 102,
    appointment_datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    appointment_type: 'IN_PERSON',
    telemedicine_url: null
  }
];

export const getAppointments = async (req, res) => {
  res.json({ appointments: inMemoryAppointments });
};

export const createAppointment = async (req, res) => {
  const newApt = {
    appointment_id: Math.floor(1000 + Math.random() * 9000),
    patient_id: req.body.patient_id || 1,
    doctor_id: req.body.doctor_id || 101,
    appointment_datetime: req.body.appointment_datetime || new Date(Date.now() + 24*3600*1000).toISOString(),
    status: 'SCHEDULED',
    appointment_type: req.body.appointment_type || 'VIDEO',
    telemedicine_url: `/consultation/room_${Date.now()}`
  };
  inMemoryAppointments.unshift(newApt);
  res.status(201).json({ message: 'Appointment created successfully', appointment: newApt });
};

export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const apt = inMemoryAppointments.find(a => a.appointment_id === Number(id));
  if (apt) {
    apt.status = status;
  }
  res.json({ message: 'Appointment updated', appointment: apt });
};
