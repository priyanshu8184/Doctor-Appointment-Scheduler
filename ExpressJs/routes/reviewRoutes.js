const express = require("express");
const router = express.Router();

const {
    createReview,
    getDoctorReviews,
    getReviewById,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

// Create review
router.post("/", createReview);

// Get reviews of a doctor
router.get("/doctor/:doctor_id", getDoctorReviews);

// Get review by ID
router.get("/:id", getReviewById);

// Update review
router.put("/:id", updateReview);

// Delete review
router.delete("/:id", deleteReview);

module.exports = router;