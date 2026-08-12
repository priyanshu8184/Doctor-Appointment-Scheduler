const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

// Create doctor
router.post("/", createDoctor);

// Get all doctors
router.get("/", getAllDoctors);

// Get doctor by ID
router.get("/:id", getDoctorById);

// Update doctor
router.put("/:id", updateDoctor);

// Delete doctor
router.delete("/:id", deleteDoctor);

module.exports = router;