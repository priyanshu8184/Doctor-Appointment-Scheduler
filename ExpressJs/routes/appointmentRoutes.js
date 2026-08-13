const express = require("express");
const router = express.Router();

const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    updateAppointmentStatus,
    cancelAppointment
} = require("../controllers/appointmentController");

// Create appointment
router.post("/", createAppointment);

// Get all appointments
router.get("/", getAllAppointments);

// Get appointment by ID
router.get("/:id", getAppointmentById);

// Update appointment details
router.put("/:id", updateAppointment);

// Update appointment status
router.patch("/:id/status", updateAppointmentStatus);

// Cancel appointment
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;