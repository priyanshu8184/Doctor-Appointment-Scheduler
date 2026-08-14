const Doctor = require("../models/Doctor");
const User = require("../models/user");

// GET all pending doctors
const getPendingDoctors = async (req, res) => {
    try {
        Doctor.belongsTo(User, { foreignKey: 'user_id' });
        
        const pendingDoctors = await Doctor.findAll({
            where: { status: 'PENDING' },
            include: [{
                model: User,
                attributes: ['email', 'created_at']
            }]
        });

        res.status(200).json({
            message: "Pending doctors fetched successfully",
            doctors: pendingDoctors
        });
    } catch (error) {
        console.error("Get Pending Doctors Error:", error);
        res.status(500).json({
            message: "Error fetching pending doctors",
            error: error.message
        });
    }
};

// APPROVE doctor
const approveDoctor = async (req, res) => {
    try {
        const { id } = req.params; // doctor_id

        const doctor = await Doctor.findByPk(id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.status = 'APPROVED';
        await doctor.save();

        res.status(200).json({
            message: "Doctor approved successfully",
            doctor
        });
    } catch (error) {
        console.error("Approve Doctor Error:", error);
        res.status(500).json({
            message: "Error approving doctor",
            error: error.message
        });
    }
};

// REJECT doctor
const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params; // doctor_id

        const doctor = await Doctor.findByPk(id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.status = 'REJECTED';
        await doctor.save();

        res.status(200).json({
            message: "Doctor rejected successfully",
            doctor
        });
    } catch (error) {
        console.error("Reject Doctor Error:", error);
        res.status(500).json({
            message: "Error rejecting doctor",
            error: error.message
        });
    }
};

module.exports = {
    getPendingDoctors,
    approveDoctor,
    rejectDoctor
};
