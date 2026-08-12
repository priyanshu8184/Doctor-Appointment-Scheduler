const { Doctor, User } = require("../models");

// ======================================================
// CREATE DOCTOR
// ======================================================
const createDoctor = async (req, res) => {
    try {
        const {
            doctor_id,
            user_id,
            first_name,
            last_name,
            bio,
            location,
            consultation_fee
        } = req.body;

        // Required fields
        if (
            doctor_id === undefined ||
            !user_id ||
            !first_name ||
            !last_name ||
            consultation_fee === undefined
        ) {
            return res.status(400).json({
                message:
                    "doctor_id, user_id, first_name, last_name and consultation_fee are required"
            });
        }

        // Check user
        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // User must have DOCTOR role
        if (user.role !== "DOCTOR") {
            return res.status(400).json({
                message: "The user role must be DOCTOR"
            });
        }

        // Check doctor ID
        const existingDoctor = await Doctor.findByPk(doctor_id);

        if (existingDoctor) {
            return res.status(409).json({
                message: "Doctor already exists"
            });
        }

        // Check whether user is already linked to a doctor
        const existingUserDoctor = await Doctor.findOne({
            where: { user_id }
        });

        if (existingUserDoctor) {
            return res.status(409).json({
                message: "This user is already linked to a doctor"
            });
        }

        const doctor = await Doctor.create({
            doctor_id,
            user_id,
            first_name,
            last_name,
            bio,
            location,
            consultation_fee
        });

        res.status(201).json({
            message: "Doctor created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create Doctor Error:", error);

        res.status(500).json({
            message: "Error creating doctor",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL DOCTORS
// ======================================================
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll();

        res.status(200).json({
            message: "Doctors fetched successfully",
            doctors
        });

    } catch (error) {
        console.error("Get All Doctors Error:", error);

        res.status(500).json({
            message: "Error fetching doctors",
            error: error.message
        });
    }
};


// ======================================================
// GET DOCTOR BY ID
// ======================================================
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByPk(id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            message: "Doctor fetched successfully",
            doctor
        });

    } catch (error) {
        console.error("Get Doctor By ID Error:", error);

        res.status(500).json({
            message: "Error fetching doctor",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE DOCTOR
// ======================================================
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByPk(id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const {
            first_name,
            last_name,
            bio,
            location,
            consultation_fee
        } = req.body;

        // Update only supplied fields
        if (first_name !== undefined) {
            doctor.first_name = first_name;
        }

        if (last_name !== undefined) {
            doctor.last_name = last_name;
        }

        if (bio !== undefined) {
            doctor.bio = bio;
        }

        if (location !== undefined) {
            doctor.location = location;
        }

        if (consultation_fee !== undefined) {
            doctor.consultation_fee = consultation_fee;
        }

        await doctor.save();

        res.status(200).json({
            message: "Doctor updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update Doctor Error:", error);

        res.status(500).json({
            message: "Error updating doctor",
            error: error.message
        });
    }
};


// ======================================================
// DELETE DOCTOR
// ======================================================
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByPk(id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        await doctor.destroy();

        res.status(200).json({
            message: "Doctor deleted successfully"
        });

    } catch (error) {
        console.error("Delete Doctor Error:", error);

        res.status(500).json({
            message: "Error deleting doctor",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};