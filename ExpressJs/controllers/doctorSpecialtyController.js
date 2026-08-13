const { Doctor, Specialty, DoctorSpecialty } = require("../models/Doctor");

// ======================================================
// ADD SPECIALTY TO DOCTOR
// ======================================================
const addSpecialtyToDoctor = async (req, res) => {
    try {
        const { doctor_id, specialty_id } = req.body;

        // Check required fields
        if (!doctor_id || !specialty_id) {
            return res.status(400).json({
                message: "doctor_id and specialty_id are required"
            });
        }

        // Check doctor exists
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Check specialty exists
        const specialty = await Specialty.findByPk(specialty_id);

        if (!specialty) {
            return res.status(404).json({
                message: "Specialty not found"
            });
        }

        // Check if relationship already exists
        const existing = await DoctorSpecialty.findOne({
            where: {
                doctor_id,
                specialty_id
            }
        });

        if (existing) {
            return res.status(409).json({
                message: "Specialty is already assigned to this doctor"
            });
        }

        // Create relationship
        const doctorSpecialty = await DoctorSpecialty.create({
            doctor_id,
            specialty_id
        });

        res.status(201).json({
            message: "Specialty added to doctor successfully",
            doctorSpecialty
        });

    } catch (error) {
        console.error("Add Specialty Error:", error);

        res.status(500).json({
            message: "Error adding specialty to doctor",
            error: error.message
        });
    }
};


// ======================================================
// GET DOCTOR SPECIALTIES
// ======================================================
const getDoctorSpecialties = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        // Check doctor exists
        const doctor = await Doctor.findByPk(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Get all specialties assigned to doctor
        const specialties = await DoctorSpecialty.findAll({
            where: {
                doctor_id
            },
            include: [
                {
                    model: Specialty,
                    attributes: [
                        "specialty_id",
                        "name",
                        "description"
                    ]
                }
            ]
        });

        res.status(200).json({
            message: "Doctor specialties fetched successfully",
            specialties
        });

    } catch (error) {
        console.error("Get Doctor Specialties Error:", error);

        res.status(500).json({
            message: "Error fetching doctor specialties",
            error: error.message
        });
    }
};


// ======================================================
// REMOVE SPECIALTY FROM DOCTOR
// ======================================================
const removeSpecialtyFromDoctor = async (req, res) => {
    try {
        const { doctor_id, specialty_id } = req.params;

        // Check relationship exists
        const doctorSpecialty = await DoctorSpecialty.findOne({
            where: {
                doctor_id,
                specialty_id
            }
        });

        if (!doctorSpecialty) {
            return res.status(404).json({
                message: "Doctor-specialty relationship not found"
            });
        }

        // Remove relationship
        await doctorSpecialty.destroy();

        res.status(200).json({
            message: "Specialty removed from doctor successfully"
        });

    } catch (error) {
        console.error("Remove Specialty Error:", error);

        res.status(500).json({
            message: "Error removing specialty from doctor",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    addSpecialtyToDoctor,
    getDoctorSpecialties,
    removeSpecialtyFromDoctor
};