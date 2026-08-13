const express = require("express");
const router = express.Router();

const {
    createPayment,
    getPaymentById,
    getPatientPayments,
    updatePaymentStatus,
    refundPayment
} = require("../controllers/paymentController");

// Create payment
router.post("/", createPayment);

// Get payment by ID
router.get("/:id", getPaymentById);

// Get payments for a patient
router.get("/patient/:patient_id", getPatientPayments);

// Update payment status
router.patch("/:id/status", updatePaymentStatus);

// Refund payment
router.patch("/:id/refund", refundPayment);

module.exports = router;