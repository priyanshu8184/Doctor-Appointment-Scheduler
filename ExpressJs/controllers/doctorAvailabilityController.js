const DoctorAvailability = require("../models/doctor_availability");
const Doctor = require("../models/Doctor");

// ======================================================
// CREATE AVAILABILITY
// ======================================================
const createAvailability = async (req, res) => {
    try {
        const {
            doctor_id,
            day_of_week,
            start_time,
            end_time,
            slot_duration_minutes
        } = req.body;

        // Required fields
        if (
            !doctor_id ||
            !day_of_week ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                message:
                    "doctor_id, day_of_week, start_time and end_time are required"
            });
        }

        // Check doctor exists
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Validate time
        if (start_time >= end_time) {
            return res.status(400).json({
                message: "start_time must be before end_time"
            });
        }

        // Create availability
        const availability = await DoctorAvailability.create({
            doctor_id,
            day_of_week,
            start_time,
            end_time,
            slot_duration_minutes:
                slot_duration_minutes !== undefined
                    ? slot_duration_minutes
                    : 30
        });

        res.status(201).json({
            message: "Doctor availability created successfully",
            availability
        });

    } catch (error) {
        console.error("Create Availability Error:", error);

        res.status(500).json({
            message: "Error creating doctor availability",
            error: error.message
        });
    }
};


// ======================================================
// GET DOCTOR AVAILABILITY
// ======================================================
const getDoctorAvailability = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        // Check doctor exists
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const availability = await DoctorAvailability.findAll({
            where: {
                doctor_id
            },
            order: [
                ["day_of_week", "ASC"],
                ["start_time", "ASC"]
            ]
        });

        res.status(200).json({
            message: "Doctor availability fetched successfully",
            availability
        });

    } catch (error) {
        console.error("Get Availability Error:", error);

        res.status(500).json({
            message: "Error fetching doctor availability",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE AVAILABILITY
// ======================================================
const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability =
            await DoctorAvailability.findByPk(id);

        if (!availability) {
            return res.status(404).json({
                message: "Availability not found"
            });
        }

        const {
            day_of_week,
            start_time,
            end_time,
            slot_duration_minutes
        } = req.body;

        // Use existing values if not provided
        const newStartTime =
            start_time !== undefined
                ? start_time
                : availability.start_time;

        const newEndTime =
            end_time !== undefined
                ? end_time
                : availability.end_time;

        // Validate time
        if (newStartTime >= newEndTime) {
            return res.status(400).json({
                message: "start_time must be before end_time"
            });
        }

        // Update fields
        if (day_of_week !== undefined) {
            availability.day_of_week = day_of_week;
        }

        if (start_time !== undefined) {
            availability.start_time = start_time;
        }

        if (end_time !== undefined) {
            availability.end_time = end_time;
        }

        if (slot_duration_minutes !== undefined) {
            availability.slot_duration_minutes =
                slot_duration_minutes;
        }

        await availability.save();

        res.status(200).json({
            message: "Doctor availability updated successfully",
            availability
        });

    } catch (error) {
        console.error("Update Availability Error:", error);

        res.status(500).json({
            message: "Error updating doctor availability",
            error: error.message
        });
    }
};


// ======================================================
// DELETE AVAILABILITY
// ======================================================
const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability =
            await DoctorAvailability.findByPk(id);

        if (!availability) {
            return res.status(404).json({
                message: "Availability not found"
            });
        }

        await availability.destroy();

        res.status(200).json({
            message: "Doctor availability deleted successfully"
        });

    } catch (error) {
        console.error("Delete Availability Error:", error);

        res.status(500).json({
            message: "Error deleting doctor availability",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createAvailability,
    getDoctorAvailability,
    updateAvailability,
    deleteAvailability
};