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
router.post("/", upload.fields([{ name: "profile_picture", maxCount: 1 }, { name: "certificate", maxCount: 1 }]), createDoctor);

// Get all doctors
router.get("/", getAllDoctors);

// Get doctor by ID
router.get("/:id", getDoctorById);

// Update doctor
router.put("/:id", upload.fields([{ name: "profile_picture", maxCount: 1 }, { name: "certificate", maxCount: 1 }]), updateDoctor);

// Delete doctor
router.delete("/:id", deleteDoctor);

module.exports = router;