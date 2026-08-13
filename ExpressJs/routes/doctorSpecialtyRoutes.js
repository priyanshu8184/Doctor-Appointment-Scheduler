const express = require("express");
const router = express.Router();

const {
    addSpecialtyToDoctor,
    getDoctorSpecialties,
    removeSpecialtyFromDoctor
} = require("../controllers/doctorSpecialtyController");

// Add specialty to doctor
router.post("/", addSpecialtyToDoctor);

// Get all specialties of a doctor
router.get("/doctor/:doctor_id", getDoctorSpecialties);

// Remove specialty from doctor
router.delete(
    "/doctor/:doctor_id/specialty/:specialty_id",
    removeSpecialtyFromDoctor
);

module.exports = router;