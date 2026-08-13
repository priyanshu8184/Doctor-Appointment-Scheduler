const express = require("express");
const router = express.Router();

const {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

const upload = require("../middlewares/upload");

// Create patient
router.post("/", upload.single("profile_picture"), createPatient);

// Get all patients
router.get("/", getAllPatients);

// Get patient by ID
router.get("/:id", getPatientById);

// Update patient
router.put("/:id", updatePatient);

// Delete patient
router.delete("/:id", deletePatient);

module.exports = router;