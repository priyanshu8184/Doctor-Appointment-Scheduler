const express = require("express");
const router = express.Router();

const {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

// Create patient
router.post("/", createPatient);

// Get all patients
router.get("/", getAllPatients);

// Get patient by ID
router.get("/:id", getPatientById);

// Update patient
router.put("/:id", updatePatient);

// Delete patient
router.delete("/:id", deletePatient);

module.exports = router;