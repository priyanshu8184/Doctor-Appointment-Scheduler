const Specialty  = require("../models/specialties");

// ======================================================
// CREATE SPECIALTY
// ======================================================
const createSpecialty = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Required field
        if (!name) {
            return res.status(400).json({
                message: "Specialty name is required"
            });
        }

        // Check duplicate specialty name
        const existingSpecialty = await Specialty.findOne({
            where: { name }
        });

        if (existingSpecialty) {
            return res.status(409).json({
                message: "Specialty already exists"
            });
        }

        const specialty = await Specialty.create({
            name,
            description
        });

        res.status(201).json({
            message: "Specialty created successfully",
            specialty
        });

    } catch (error) {
        console.error("Create Specialty Error:", error);

        res.status(500).json({
            message: "Error creating specialty",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL SPECIALTIES
// ======================================================
const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.findAll({
            order: [["name", "ASC"]]
        });

        res.status(200).json({
            message: "Specialties fetched successfully",
            specialties
        });

    } catch (error) {
        console.error("Get All Specialties Error:", error);

        res.status(500).json({
            message: "Error fetching specialties",
            error: error.message
        });
    }
};


// ======================================================
// GET SPECIALTY BY ID
// ======================================================
const getSpecialtyById = async (req, res) => {
    try {
        const { id } = req.params;

        const specialty = await Specialty.findByPk(id);

        if (!specialty) {
            return res.status(404).json({
                message: "Specialty not found"
            });
        }

        res.status(200).json({
            message: "Specialty fetched successfully",
            specialty
        });

    } catch (error) {
        console.error("Get Specialty By ID Error:", error);

        res.status(500).json({
            message: "Error fetching specialty",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE SPECIALTY
// ======================================================
const updateSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const specialty = await Specialty.findByPk(id);

        if (!specialty) {
            return res.status(404).json({
                message: "Specialty not found"
            });
        }

        // Check duplicate name only if name is being changed
        if (name && name !== specialty.name) {
            const existingSpecialty = await Specialty.findOne({
                where: { name }
            });

            if (existingSpecialty) {
                return res.status(409).json({
                    message: "Specialty name already exists"
                });
            }

            specialty.name = name;
        }

        // Update description if provided
        if (description !== undefined) {
            specialty.description = description;
        }

        await specialty.save();

        res.status(200).json({
            message: "Specialty updated successfully",
            specialty
        });

    } catch (error) {
        console.error("Update Specialty Error:", error);

        res.status(500).json({
            message: "Error updating specialty",
            error: error.message
        });
    }
};


// ======================================================
// DELETE SPECIALTY
// ======================================================
const deleteSpecialty = async (req, res) => {
    try {
        const { id } = req.params;

        const specialty = await Specialty.findByPk(id);

        if (!specialty) {
            return res.status(404).json({
                message: "Specialty not found"
            });
        }

        await specialty.destroy();

        res.status(200).json({
            message: "Specialty deleted successfully"
        });

    } catch (error) {
        console.error("Delete Specialty Error:", error);

        res.status(500).json({
            message: "Error deleting specialty",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createSpecialty,
    getAllSpecialties,
    getSpecialtyById,
    updateSpecialty,
    deleteSpecialty
};