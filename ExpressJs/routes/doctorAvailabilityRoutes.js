const express = require("express");
const router = express.Router();

const {
    createAvailability,
    getDoctorAvailability,
    updateAvailability,
    deleteAvailability
} = require("../controllers/doctorAvailabilityController");

// Create availability
router.post("/", createAvailability);

// Get availability of a doctor
router.get("/doctor/:doctor_id", getDoctorAvailability);

// Update availability
router.put("/:id", updateAvailability);

// Delete availability
router.delete("/:id", deleteAvailability);

module.exports = router;
