const express = require("express");
const router = express.Router();

const {
    addToWaitlist,
    getWaitlist,
    updateWaitlistStatus,
    removeFromWaitlist
} = require("../controllers/waitlistController");

// Add patient to waitlist
router.post("/", addToWaitlist);

// Get waitlist
// Optional query filters:
// ?doctor_id=101
// ?patient_id=201
// ?requested_date=2026-08-20
router.get("/", getWaitlist);

// Update waitlist status
router.patch("/:id/status", updateWaitlistStatus);

// Remove from waitlist
router.delete("/:id", removeFromWaitlist);

module.exports = router;