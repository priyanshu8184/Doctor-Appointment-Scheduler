const {
    Prescription,
    MedicalRecord
} = require("../models");


// ======================================================
// CREATE PRESCRIPTION
// ======================================================
const createPrescription = async (req, res) => {
    try {
        const {
            record_id,
            medication_name,
            dosage,
            instructions
        } = req.body;

        // Required fields
        if (
            !record_id ||
            !medication_name ||
            !dosage
        ) {
            return res.status(400).json({
                message:
                    "record_id, medication_name and dosage are required"
            });
        }

        // Check medical record exists
        const record = await MedicalRecord.findByPk(record_id);

        if (!record) {
            return res.status(404).json({
                message: "Medical record not found"
            });
        }

        // Create prescription
        const prescription = await Prescription.create({
            record_id,
            medication_name,
            dosage,
            instructions
        });

        res.status(201).json({
            message: "Prescription created successfully",
            prescription
        });

    } catch (error) {
        console.error("Create Prescription Error:", error);

        res.status(500).json({
            message: "Error creating prescription",
            error: error.message
        });
    }
};


// ======================================================
// GET PRESCRIPTIONS
// ======================================================
const getPrescriptions = async (req, res) => {
    try {
        const { record_id } = req.query;

        const where = {};

        // Optional filter by medical record
        if (record_id) {
            where.record_id = record_id;
        }

        const prescriptions = await Prescription.findAll({
            where,
            order: [
                ["issued_at", "DESC"]
            ]
        });

        res.status(200).json({
            message: "Prescriptions fetched successfully",
            prescriptions
        });

    } catch (error) {
        console.error("Get Prescriptions Error:", error);

        res.status(500).json({
            message: "Error fetching prescriptions",
            error: error.message
        });
    }
};


// ======================================================
// GET PRESCRIPTION BY ID
// ======================================================
const getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await Prescription.findByPk(id);

        if (!prescription) {
            return res.status(404).json({
                message: "Prescription not found"
            });
        }

        res.status(200).json({
            message: "Prescription fetched successfully",
            prescription
        });

    } catch (error) {
        console.error("Get Prescription By ID Error:", error);

        res.status(500).json({
            message: "Error fetching prescription",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE PRESCRIPTION
// ======================================================
const updatePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await Prescription.findByPk(id);

        if (!prescription) {
            return res.status(404).json({
                message: "Prescription not found"
            });
        }

        const {
            medication_name,
            dosage,
            instructions
        } = req.body;

        // Update only provided fields
        if (medication_name !== undefined) {
            prescription.medication_name = medication_name;
        }

        if (dosage !== undefined) {
            prescription.dosage = dosage;
        }

        if (instructions !== undefined) {
            prescription.instructions = instructions;
        }

        await prescription.save();

        res.status(200).json({
            message: "Prescription updated successfully",
            prescription
        });

    } catch (error) {
        console.error("Update Prescription Error:", error);

        res.status(500).json({
            message: "Error updating prescription",
            error: error.message
        });
    }
};


// ======================================================
// DELETE PRESCRIPTION
// ======================================================
const deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await Prescription.findByPk(id);

        if (!prescription) {
            return res.status(404).json({
                message: "Prescription not found"
            });
        }

        await prescription.destroy();

        res.status(200).json({
            message: "Prescription deleted successfully"
        });

    } catch (error) {
        console.error("Delete Prescription Error:", error);

        res.status(500).json({
            message: "Error deleting prescription",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
};