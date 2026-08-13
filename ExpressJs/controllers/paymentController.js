const { Payment, Appointment } = require("../models");

// Allowed payment types
const ALLOWED_PAYMENT_TYPES = [
    "FULL_FEE",
    "CO_PAY"
];

// Allowed payment statuses
const ALLOWED_PAYMENT_STATUSES = [
    "PENDING",
    "COMPLETED",
    "REFUNDED",
    "FAILED"
];

// ======================================================
// CREATE PAYMENT
// ======================================================
const createPayment = async (req, res) => {
    try {
        const {
            appointment_id,
            stripe_transaction_id,
            total_amount,
            payment_type,
            payment_status
        } = req.body;

        // Required fields
        if (
            !appointment_id ||
            total_amount === undefined ||
            !payment_type
        ) {
            return res.status(400).json({
                message:
                    "appointment_id, total_amount and payment_type are required"
            });
        }

        // Check appointment exists
        const appointment = await Appointment.findByPk(
            appointment_id
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Validate payment type
        if (!ALLOWED_PAYMENT_TYPES.includes(payment_type)) {
            return res.status(400).json({
                message:
                    "Invalid payment_type. Allowed values: FULL_FEE, CO_PAY"
            });
        }

        // Validate payment status
        if (
            payment_status !== undefined &&
            !ALLOWED_PAYMENT_STATUSES.includes(payment_status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid payment_status. Allowed values: PENDING, COMPLETED, REFUNDED, FAILED"
            });
        }

        // Amount must be positive
        if (Number(total_amount) <= 0) {
            return res.status(400).json({
                message: "total_amount must be greater than 0"
            });
        }

        // Create payment
        const payment = await Payment.create({
            appointment_id,
            stripe_transaction_id,
            total_amount,
            payment_type,
            payment_status: payment_status || "PENDING",
            refunded_amount: 0.00
        });

        res.status(201).json({
            message: "Payment created successfully",
            payment
        });

    } catch (error) {
        console.error("Create Payment Error:", error);

        res.status(500).json({
            message: "Error creating payment",
            error: error.message
        });
    }
};


// ======================================================
// GET PAYMENT BY ID
// ======================================================
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json({
            message: "Payment fetched successfully",
            payment
        });

    } catch (error) {
        console.error("Get Payment Error:", error);

        res.status(500).json({
            message: "Error fetching payment",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE PAYMENT STATUS
// ======================================================
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        if (!payment_status) {
            return res.status(400).json({
                message: "payment_status is required"
            });
        }

        // Validate status
        if (!ALLOWED_PAYMENT_STATUSES.includes(payment_status)) {
            return res.status(400).json({
                message:
                    "Invalid payment_status. Allowed values: PENDING, COMPLETED, REFUNDED, FAILED"
            });
        }

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // A refunded payment should normally remain refunded
        if (
            payment.payment_status === "REFUNDED" &&
            payment_status !== "REFUNDED"
        ) {
            return res.status(400).json({
                message: "A refunded payment cannot be changed to another status"
            });
        }

        payment.payment_status = payment_status;

        await payment.save();

        res.status(200).json({
            message: "Payment status updated successfully",
            payment
        });

    } catch (error) {
        console.error("Update Payment Status Error:", error);

        res.status(500).json({
            message: "Error updating payment status",
            error: error.message
        });
    }
};


// ======================================================
// REFUND PAYMENT
// ======================================================
const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { refunded_amount } = req.body;

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // Payment must be completed before refund
        if (payment.payment_status !== "COMPLETED") {
            return res.status(400).json({
                message:
                    "Only completed payments can be refunded"
            });
        }

        const paymentAmount = Number(payment.total_amount);

        // If no amount is provided, refund full amount
        const refundAmount =
            refunded_amount !== undefined
                ? Number(refunded_amount)
                : paymentAmount;

        // Validate refund amount
        if (refundAmount <= 0) {
            return res.status(400).json({
                message: "Refund amount must be greater than 0"
            });
        }

        if (refundAmount > paymentAmount) {
            return res.status(400).json({
                message:
                    "Refund amount cannot be greater than total payment amount"
            });
        }

        // Update refund
        payment.refunded_amount = refundAmount;
        payment.payment_status = "REFUNDED";

        await payment.save();

        res.status(200).json({
            message: "Payment refunded successfully",
            payment
        });

    } catch (error) {
        console.error("Refund Payment Error:", error);

        res.status(500).json({
            message: "Error refunding payment",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createPayment,
    getPaymentById,
    updatePaymentStatus,
    refundPayment
};