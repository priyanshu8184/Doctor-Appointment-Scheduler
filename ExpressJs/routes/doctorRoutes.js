const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

const upload = require("../middlewares/upload");

// Create doctor
router.post("/", upload.single("profile_picture"), createDoctor);

// Get all doctors
router.get("/", getAllDoctors);

// Get doctor by ID
router.get("/:id", getDoctorById);

// Update doctor
router.put("/:id", updateDoctor);

// Delete doctor
router.delete("/:id", deleteDoctor);

module.exports = router;