const Review= require("../models/reviews");
const Appointment = require("../models/appointments");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");


// ======================================================
// CREATE REVIEW
// ======================================================
const createReview = async (req, res) => {
    try {
        const {
            appointment_id,
            patient_id,
            doctor_id,
            rating,
            comment
        } = req.body;

        // Required fields
        if (
            !appointment_id ||
            !patient_id ||
            !doctor_id ||
            rating === undefined
        ) {
            return res.status(400).json({
                message:
                    "appointment_id, patient_id, doctor_id and rating are required"
            });
        }

        // Validate rating
        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Check patient
        const patient = await Patient.findByPk(patient_id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Check doctor
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Check appointment
        const appointment = await Appointment.findByPk(
            appointment_id
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure appointment belongs to patient
        if (
            Number(appointment.patient_id) !==
            Number(patient_id)
        ) {
            return res.status(400).json({
                message:
                    "Appointment does not belong to this patient"
            });
        }

        // Make sure appointment belongs to doctor
        if (
            Number(appointment.doctor_id) !==
            Number(doctor_id)
        ) {
            return res.status(400).json({
                message:
                    "Appointment does not belong to this doctor"
            });
        }

        // Review should normally be for a completed appointment
        if (appointment.status !== "COMPLETED") {
            return res.status(400).json({
                message:
                    "Review can only be created for a completed appointment"
            });
        }

        // appointment_id is UNIQUE in your database
        const existingReview = await Review.findOne({
            where: {
                appointment_id
            }
        });

        if (existingReview) {
            return res.status(409).json({
                message:
                    "A review already exists for this appointment"
            });
        }

        // Create review
        const review = await Review.create({
            appointment_id,
            patient_id,
            doctor_id,
            rating,
            comment
        });

        res.status(201).json({
            message: "Review created successfully",
            review
        });

    } catch (error) {
        console.error("Create Review Error:", error);

        res.status(500).json({
            message: "Error creating review",
            error: error.message
        });
    }
};


// ======================================================
// GET DOCTOR REVIEWS
// ======================================================
const getDoctorReviews = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        // Check doctor
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const reviews = await Review.findAll({
            where: {
                doctor_id
            },
            order: [
                ["created_at", "DESC"]
            ]
        });

        res.status(200).json({
            message: "Doctor reviews fetched successfully",
            reviews
        });

    } catch (error) {
        console.error("Get Doctor Reviews Error:", error);

        res.status(500).json({
            message: "Error fetching doctor reviews",
            error: error.message
        });
    }
};

// ======================================================
// GET PATIENT REVIEWS
// ======================================================
const getPatientReviews = async (req, res) => {
    try {
        const { patient_id } = req.params;

        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const reviews = await Review.findAll({
            where: {
                patient_id
            },
            order: [
                ["created_at", "DESC"]
            ]
        });

        res.status(200).json({
            message: "Patient reviews fetched successfully",
            reviews
        });

    } catch (error) {
        console.error("Get Patient Reviews Error:", error);
        res.status(500).json({
            message: "Error fetching patient reviews",
            error: error.message
        });
    }
};


// ======================================================
// GET REVIEW BY ID
// ======================================================
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.status(200).json({
            message: "Review fetched successfully",
            review
        });

    } catch (error) {
        console.error("Get Review By ID Error:", error);

        res.status(500).json({
            message: "Error fetching review",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE REVIEW
// ======================================================
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        // Validate rating if provided
        if (
            rating !== undefined &&
            (Number(rating) < 1 || Number(rating) > 5)
        ) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Update fields
        if (rating !== undefined) {
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        res.status(200).json({
            message: "Review updated successfully",
            review
        });

    } catch (error) {
        console.error("Update Review Error:", error);

        res.status(500).json({
            message: "Error updating review",
            error: error.message
        });
    }
};


// ======================================================
// DELETE REVIEW
// ======================================================
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        await review.destroy();

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete Review Error:", error);

        res.status(500).json({
            message: "Error deleting review",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createReview,
    getDoctorReviews,
    getPatientReviews,
    getReviewById,
    updateReview,
    deleteReview
};
