const PatientInsurance = require("../models/patient_insurance");
const Patient = require("../models/Patient");

// Allowed eligibility statuses
const ALLOWED_STATUSES = [
    "VERIFIED",
    "PENDING",
    "REJECTED"
];

// ======================================================
// ADD INSURANCE
// ======================================================
const addInsurance = async (req, res) => {
    try {
        const {
            patient_id,
            provider_name,
            policy_number,
            eligibility_status,
            co_pay_amount
        } = req.body;

        // Required fields
        if (
            !patient_id ||
            !provider_name ||
            !policy_number
        ) {
            return res.status(400).json({
                message:
                    "patient_id, provider_name and policy_number are required"
            });
        }

        // Check patient exists
        const patient = await Patient.findByPk(patient_id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Validate eligibility status
        if (
            eligibility_status !== undefined &&
            !ALLOWED_STATUSES.includes(eligibility_status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid eligibility_status. Allowed values: VERIFIED, PENDING, REJECTED"
            });
        }

        // Check unique policy number
        const existingInsurance = await PatientInsurance.findOne({
            where: {
                policy_number
            }
        });

        if (existingInsurance) {
            return res.status(409).json({
                message: "Policy number already exists"
            });
        }

        // Create insurance
        const insurance = await PatientInsurance.create({
            patient_id,
            provider_name,
            policy_number,
            eligibility_status:
                eligibility_status || "PENDING",
            co_pay_amount:
                co_pay_amount !== undefined
                    ? co_pay_amount
                    : 0.00
        });

        res.status(201).json({
            message: "Patient insurance added successfully",
            insurance
        });

    } catch (error) {
        console.error("Add Insurance Error:", error);

        res.status(500).json({
            message: "Error adding patient insurance",
            error: error.message
        });
    }
};


// ======================================================
// GET PATIENT INSURANCE
// ======================================================
const getPatientInsurance = async (req, res) => {
    try {
        const { patient_id } = req.params;

        // Check patient exists
        const patient = await Patient.findByPk(patient_id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const insurance = await PatientInsurance.findAll({
            where: {
                patient_id
            },
            order: [["insurance_id", "DESC"]]
        });

        res.status(200).json({
            message: "Patient insurance fetched successfully",
            insurance
        });

    } catch (error) {
        console.error("Get Patient Insurance Error:", error);

        res.status(500).json({
            message: "Error fetching patient insurance",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE INSURANCE
// ======================================================
const updateInsurance = async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await PatientInsurance.findByPk(id);

        if (!insurance) {
            return res.status(404).json({
                message: "Insurance record not found"
            });
        }

        const {
            provider_name,
            policy_number,
            eligibility_status,
            co_pay_amount
        } = req.body;

        // Check duplicate policy number
        if (
            policy_number !== undefined &&
            policy_number !== insurance.policy_number
        ) {
            const existingInsurance =
                await PatientInsurance.findOne({
                    where: {
                        policy_number
                    }
                });

            if (existingInsurance) {
                return res.status(409).json({
                    message: "Policy number already exists"
                });
            }

            insurance.policy_number = policy_number;
        }

        // Validate status
        if (
            eligibility_status !== undefined &&
            !ALLOWED_STATUSES.includes(eligibility_status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid eligibility_status. Allowed values: VERIFIED, PENDING, REJECTED"
            });
        }

        if (provider_name !== undefined) {
            insurance.provider_name = provider_name;
        }

        if (eligibility_status !== undefined) {
            insurance.eligibility_status =
                eligibility_status;
        }

        if (co_pay_amount !== undefined) {
            insurance.co_pay_amount = co_pay_amount;
        }

        await insurance.save();

        res.status(200).json({
            message: "Patient insurance updated successfully",
            insurance
        });

    } catch (error) {
        console.error("Update Insurance Error:", error);

        res.status(500).json({
            message: "Error updating patient insurance",
            error: error.message
        });
    }
};


// ======================================================
// DELETE INSURANCE
// ======================================================
const deleteInsurance = async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await PatientInsurance.findByPk(id);

        if (!insurance) {
            return res.status(404).json({
                message: "Insurance record not found"
            });
        }

        await insurance.destroy();

        res.status(200).json({
            message: "Patient insurance deleted successfully"
        });

    } catch (error) {
        console.error("Delete Insurance Error:", error);

        res.status(500).json({
            message: "Error deleting patient insurance",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    addInsurance,
    getPatientInsurance,
    updateInsurance,
    deleteInsurance
};