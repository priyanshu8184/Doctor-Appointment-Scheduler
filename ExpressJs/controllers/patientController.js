const { Patient, User } = require("../models");

// ======================================================
// CREATE PATIENT
// ======================================================
const createPatient = async (req, res) => {
    try {
        const {
            patient_id,
            user_id,
            first_name,
            last_name,
            date_of_birth,
            phone_number
        } = req.body;

        // Check required fields
        if (
            !patient_id ||
            !user_id ||
            !first_name ||
            !last_name ||
            !date_of_birth
        ) {
            return res.status(400).json({
                message:
                    "patient_id, user_id, first_name, last_name and date_of_birth are required"
            });
        }

        // Check whether user exists
        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Make sure this user is a PATIENT
        if (user.role !== "PATIENT") {
            return res.status(400).json({
                message: "The user role must be PATIENT"
            });
        }

        // Check whether patient_id already exists
        const existingPatient = await Patient.findByPk(patient_id);

        if (existingPatient) {
            return res.status(409).json({
                message: "Patient already exists"
            });
        }

        // Check whether this user is already linked to a patient
        const existingUserPatient = await Patient.findOne({
            where: { user_id }
        });

        if (existingUserPatient) {
            return res.status(409).json({
                message: "This user is already linked to a patient"
            });
        }

        const patient = await Patient.create({
            patient_id,
            user_id,
            first_name,
            last_name,
            date_of_birth,
            phone_number
        });

        res.status(201).json({
            message: "Patient created successfully",
            patient
        });

    } catch (error) {
        console.error("Create Patient Error:", error);

        res.status(500).json({
            message: "Error creating patient",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL PATIENTS
// ======================================================

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll();

        res.status(200).json({
            message: "Patients fetched successfully",
            patients
        });

    } catch (error) {
        console.error("Get All Patients Error:", error);

        res.status(500).json({
            message: "Error fetching patients",
            error: error.message
        });
    }
};


// ======================================================
// GET PATIENT BY ID
// ======================================================

const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findByPk(id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.status(200).json({
            message: "Patient fetched successfully",
            patient
        });

    } catch (error) {
        console.error("Get Patient By ID Error:", error);

        res.status(500).json({
            message: "Error fetching patient",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE PATIENT
// ======================================================
const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findByPk(id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const {
            first_name,
            last_name,
            date_of_birth,
            phone_number
        } = req.body;

        // Update only the fields provided
        if (first_name !== undefined) {
            patient.first_name = first_name;
        }

        if (last_name !== undefined) {
            patient.last_name = last_name;
        }

        if (date_of_birth !== undefined) {
            patient.date_of_birth = date_of_birth;
        }

        if (phone_number !== undefined) {
            patient.phone_number = phone_number;
        }

        await patient.save();

        res.status(200).json({
            message: "Patient updated successfully",
            patient
        });

    } catch (error) {
        console.error("Update Patient Error:", error);

        res.status(500).json({
            message: "Error updating patient",
            error: error.message
        });
    }
};


// ======================================================
// DELETE PATIENT
// ======================================================


const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findByPk(id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        await patient.destroy();

        res.status(200).json({
            message: "Patient deleted successfully"
        });

    } catch (error) {
        console.error("Delete Patient Error:", error);

        res.status(500).json({
            message: "Error deleting patient",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================


module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
};