const express = require("express");
const router = express.Router();

const {
    createSpecialty,
    getAllSpecialties,
    getSpecialtyById,
    updateSpecialty,
    deleteSpecialty
} = require("../controllers/specialtyController");

// Create specialty
router.post("/", createSpecialty);

// Get all specialties
router.get("/", getAllSpecialties);

// Get specialty by ID
router.get("/:id", getSpecialtyById);

// Update specialty
router.put("/:id", updateSpecialty);

// Delete specialty
router.delete("/:id", deleteSpecialty);

module.exports = router;