const express = require("express");
const router = express.Router();

const {
    createMedicalRecord,
    getPatientMedicalRecords,
    getMedicalRecordById,
    updateMedicalRecord
} = require("../controllers/medicalRecordController");

// Create medical record
router.post("/", createMedicalRecord);

// Get all medical records of a patient
router.get("/patient/:patient_id", getPatientMedicalRecords);

// Get medical record by ID
router.get("/:id", getMedicalRecordById);

// Update medical record
router.put("/:id", updateMedicalRecord);

module.exports = router;