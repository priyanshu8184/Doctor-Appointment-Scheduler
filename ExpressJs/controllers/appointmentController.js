const { Appointment, Patient, Doctor } = require("../models/appointments");

// Allowed appointment statuses
const ALLOWED_STATUSES = [
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW"
];

// ======================================================
// CREATE APPOINTMENT
// ======================================================
const createAppointment = async (req, res) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_datetime,
            status,
            telemedicine_url,
            calendar_sync_id
        } = req.body;

        // Required fields
        if (
            !patient_id ||
            !doctor_id ||
            !appointment_datetime
        ) {
            return res.status(400).json({
                message:
                    "patient_id, doctor_id and appointment_datetime are required"
            });
        }

        // Check patient
        const patient = await Patient.findByPk(patient_id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Check doctor
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Validate status if provided
        if (
            status !== undefined &&
            !ALLOWED_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid status. Allowed values: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW"
            });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patient_id,
            doctor_id,
            appointment_datetime,
            status: status || "SCHEDULED",
            telemedicine_url,
            calendar_sync_id
        });

        res.status(201).json({
            message: "Appointment created successfully",
            appointment
        });

    } catch (error) {
        console.error("Create Appointment Error:", error);

        res.status(500).json({
            message: "Error creating appointment",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL APPOINTMENTS
// ======================================================

const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            order: [["appointment_datetime", "ASC"]]
        });

        res.status(200).json({
            message: "Appointments fetched successfully",
            appointments
        });

    } catch (error) {
        console.error("Get All Appointments Error:", error);

        res.status(500).json({
            message: "Error fetching appointments",
            error: error.message
        });
    }
};


// ======================================================
// GET APPOINTMENT BY ID
// ======================================================
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            message: "Appointment fetched successfully",
            appointment
        });

    } catch (error) {
        console.error("Get Appointment By ID Error:", error);

        res.status(500).json({
            message: "Error fetching appointment",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE APPOINTMENT
// ======================================================
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        const {
            patient_id,
            doctor_id,
            appointment_datetime,
            telemedicine_url,
            calendar_sync_id
        } = req.body;

        // If patient_id is being changed, verify patient once again 
        if (patient_id !== undefined) {
            const patient = await Patient.findByPk(patient_id);

            if (!patient) {
                return res.status(404).json({
                    message: "Patient not found"
                });
            }

            appointment.patient_id = patient_id;
        }

        // If doctor_id is being changed, verify doctor 
        if (doctor_id !== undefined) {
            const doctor = await Doctor.findByPk(doctor_id);

            if (!doctor) {
                return res.status(404).json({
                    message: "Doctor not found"
                });
            }

            appointment.doctor_id = doctor_id;
        }

        if (appointment_datetime !== undefined) {
            appointment.appointment_datetime =
                appointment_datetime;
        }

        if (telemedicine_url !== undefined) {
            appointment.telemedicine_url = telemedicine_url;
        }

        if (calendar_sync_id !== undefined) {
            appointment.calendar_sync_id =
                calendar_sync_id;
        }

        await appointment.save();

        res.status(200).json({
            message: "Appointment updated successfully",
            appointment
        });

    } catch (error) {
        console.error("Update Appointment Error:", error);

        res.status(500).json({
            message: "Error updating appointment",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE APPOINTMENT STATUS
// ======================================================
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "status is required"
            });
        }

        // Validate status
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid status. Allowed values: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW"
            });
        }

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        appointment.status = status;

        await appointment.save();

        res.status(200).json({
            message: "Appointment status updated successfully",
            appointment
        });

    } catch (error) {
        console.error("Update Appointment Status Error:", error);

        res.status(500).json({
            message: "Error updating appointment status",
            error: error.message
        });
    }
};


// ======================================================
// CANCEL APPOINTMENT
// ======================================================
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Check if already cancelled
        if (appointment.status === "CANCELLED") {
            return res.status(400).json({
                message: "Appointment is already cancelled"
            });
        }

        // it Don't cancel the  completed appointment
        if (appointment.status === "COMPLETED") {
            return res.status(400).json({
                message: "Completed appointment cannot be cancelled"
            });
        }

        appointment.status = "CANCELLED";

        await appointment.save();

        res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        console.error("Cancel Appointment Error:", error);

        res.status(500).json({
            message: "Error cancelling appointment",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    updateAppointmentStatus,
    cancelAppointment
};