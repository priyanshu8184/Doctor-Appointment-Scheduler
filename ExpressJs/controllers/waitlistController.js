const Waitlist  = require("../models/waitlist");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// Allowed waitlist statuses
const ALLOWED_STATUSES = [
    "WAITING",
    "NOTIFIED",
    "BOOKED"
];

// ======================================================
// ADD TO WAITLIST
// ======================================================
const addToWaitlist = async (req, res) => {
    try {
        const {
            doctor_id,
            patient_id,
            requested_date,
            status
        } = req.body;

        // Required fields
        if (
            !doctor_id ||
            !patient_id ||
            !requested_date
        ) {
            return res.status(400).json({
                message:
                    "doctor_id, patient_id and requested_date are required"
            });
        }

        // Check doctor exists
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Check patient exists
        const patient = await Patient.findByPk(patient_id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Validate status
        if (
            status !== undefined &&
            !ALLOWED_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid status. Allowed values: WAITING, NOTIFIED, BOOKED"
            });
        }

        // Check whether patient is already waiting for same doctor/date
        const existingEntry = await Waitlist.findOne({
            where: {
                doctor_id,
                patient_id,
                requested_date,
                status: "WAITING"
            }
        });

        if (existingEntry) {
            return res.status(409).json({
                message:
                    "Patient is already on the waitlist for this doctor and date"
            });
        }

        const waitlist = await Waitlist.create({
            doctor_id,
            patient_id,
            requested_date,
            status: status || "WAITING"
        });

        res.status(201).json({
            message: "Patient added to waitlist successfully",
            waitlist
        });

    } catch (error) {
        console.error("Add To Waitlist Error:", error);

        res.status(500).json({
            message: "Error adding patient to waitlist",
            error: error.message
        });
    }
};


// ======================================================
// GET WAITLIST
// ======================================================
const getWaitlist = async (req, res) => {
    try {
        const { doctor_id, patient_id, requested_date } = req.query;

        const where = {};

        // Optional filters
        if (doctor_id) {
            where.doctor_id = doctor_id;
        }

        if (patient_id) {
            where.patient_id = patient_id;
        }

        if (requested_date) {
            where.requested_date = requested_date;
        }

        const waitlist = await Waitlist.findAll({
            where,
            order: [
                ["requested_date", "ASC"],
                ["created_at", "ASC"]
            ]
        });

        res.status(200).json({
            message: "Waitlist fetched successfully",
            waitlist
        });

    } catch (error) {
        console.error("Get Waitlist Error:", error);

        res.status(500).json({
            message: "Error fetching waitlist",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE WAITLIST STATUS
// ======================================================
const updateWaitlistStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "status is required"
            });
        }

        // Validate status
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid status. Allowed values: WAITING, NOTIFIED, BOOKED"
            });
        }

        const waitlist = await Waitlist.findByPk(id);

        if (!waitlist) {
            return res.status(404).json({
                message: "Waitlist entry not found"
            });
        }

        waitlist.status = status;

        await waitlist.save();

        res.status(200).json({
            message: "Waitlist status updated successfully",
            waitlist
        });

    } catch (error) {
        console.error("Update Waitlist Status Error:", error);

        res.status(500).json({
            message: "Error updating waitlist status",
            error: error.message
        });
    }
};


// ======================================================
// REMOVE FROM WAITLIST
// ======================================================
const removeFromWaitlist = async (req, res) => {
    try {
        const { id } = req.params;

        const waitlist = await Waitlist.findByPk(id);

        if (!waitlist) {
            return res.status(404).json({
                message: "Waitlist entry not found"
            });
        }

        await waitlist.destroy();

        res.status(200).json({
            message: "Patient removed from waitlist successfully"
        });

    } catch (error) {
        console.error("Remove From Waitlist Error:", error);

        res.status(500).json({
            message: "Error removing patient from waitlist",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    addToWaitlist,
    getWaitlist,
    updateWaitlistStatus,
    removeFromWaitlist
};