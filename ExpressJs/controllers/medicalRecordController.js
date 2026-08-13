const {
    MedicalRecord,
    Patient,
    Doctor,
    Appointment
} = require("../models/medical_records");


// ======================================================
// CREATE MEDICAL RECORD
// ======================================================
const createMedicalRecord = async (req, res) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_id,
            clinical_notes
        } = req.body;

        // Required fields
        if (
            !patient_id ||
            !doctor_id ||
            !appointment_id
        ) {
            return res.status(400).json({
                message:
                    "patient_id, doctor_id and appointment_id are required"
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

        // Check appointment
        const appointment = await Appointment.findByPk(
            appointment_id
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure appointment belongs to patient
        if (
            Number(appointment.patient_id) !==
            Number(patient_id)
        ) {
            return res.status(400).json({
                message:
                    "Appointment does not belong to this patient"
            });
        }

        // Make sure appointment belongs to doctor
        if (
            Number(appointment.doctor_id) !==
            Number(doctor_id)
        ) {
            return res.status(400).json({
                message:
                    "Appointment does not belong to this doctor"
            });
        }

        // Create medical record
        const record = await MedicalRecord.create({
            patient_id,
            doctor_id,
            appointment_id,
            clinical_notes
        });

        res.status(201).json({
            message: "Medical record created successfully",
            record
        });

    } catch (error) {
        console.error("Create Medical Record Error:", error);

        res.status(500).json({
            message: "Error creating medical record",
            error: error.message
        });
    }
};


// ======================================================
// GET PATIENT MEDICAL RECORDS
// ======================================================
const getPatientMedicalRecords = async (req, res) => {
    try {
        const { patient_id } = req.params;

        // Check patient
        const patient = await Patient.findByPk(patient_id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const records = await MedicalRecord.findAll({
            where: {
                patient_id
            },
            order: [
                ["date_recorded", "DESC"]
            ]
        });

        res.status(200).json({
            message:
                "Patient medical records fetched successfully",
            records
        });

    } catch (error) {
        console.error(
            "Get Patient Medical Records Error:",
            error
        );

        res.status(500).json({
            message: "Error fetching medical records",
            error: error.message
        });
    }
};


// ======================================================
// GET MEDICAL RECORD BY ID
// ======================================================
const getMedicalRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await MedicalRecord.findByPk(id);

        if (!record) {
            return res.status(404).json({
                message: "Medical record not found"
            });
        }

        res.status(200).json({
            message: "Medical record fetched successfully",
            record
        });

    } catch (error) {
        console.error(
            "Get Medical Record By ID Error:",
            error
        );

        res.status(500).json({
            message: "Error fetching medical record",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE MEDICAL RECORD
// ======================================================
const updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { clinical_notes } = req.body;

        const record = await MedicalRecord.findByPk(id);

        if (!record) {
            return res.status(404).json({
                message: "Medical record not found"
            });
        }

        // Update clinical notes only
        if (clinical_notes !== undefined) {
            record.clinical_notes = clinical_notes;
        }

        await record.save();

        res.status(200).json({
            message:
                "Medical record updated successfully",
            record
        });

    } catch (error) {
        console.error(
            "Update Medical Record Error:",
            error
        );

        res.status(500).json({
            message: "Error updating medical record",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createMedicalRecord,
    getPatientMedicalRecords,
    getMedicalRecordById,
    updateMedicalRecord
};