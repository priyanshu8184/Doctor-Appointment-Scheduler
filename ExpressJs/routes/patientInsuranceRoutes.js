const express = require("express");
const router = express.Router();

const {
    addInsurance,
    getPatientInsurance,
    updateInsurance,
    deleteInsurance
} = require("../controllers/patientInsuranceController");

// Add insurance
router.post("/", addInsurance);

// Get insurance of a patient
router.get("/patient/:patient_id", getPatientInsurance);

// Update insurance
router.put("/:id", updateInsurance);

// Delete insurance
router.delete("/:id", deleteInsurance);

module.exports = router;