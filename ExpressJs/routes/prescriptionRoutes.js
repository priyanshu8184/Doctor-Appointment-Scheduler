const express = require("express");
const router = express.Router();

const {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
} = require("../controllers/prescriptionController");

// Create prescription
router.post("/", createPrescription);

// Get all prescriptions
router.get("/", getPrescriptions);

// Get prescription by ID
router.get("/:id", getPrescriptionById);

// Update prescription
router.put("/:id", updatePrescription);

// Delete prescription
router.delete("/:id", deletePrescription);

module.exports = router;