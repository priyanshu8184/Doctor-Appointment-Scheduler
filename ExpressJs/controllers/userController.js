const bcrypt = require("bcrypt");
const User = require("../models/user");
const Doctor = require("../models/Doctor");
// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {
    try {
        const { email, password, role } = req.body; 

        // Check required fields
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password and role are required"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password_hash,
            role
        });

        // Don't send password hash to frontend
        const userResponse = {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.status(201).json({
            message: "User registered successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("Register User Error:", error);

        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
};


// ======================================================
// LOGIN USER
// ======================================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check if doctor is approved
        if (user.role === 'DOCTOR') {
            const doctor = await Doctor.findOne({ where: { user_id: user.user_id } });
            if (doctor) {
                if (doctor.status === 'PENDING') {
                    return res.status(403).json({
                        message: "Your registration is pending admin approval."
                    });
                }
                if (doctor.status === 'REJECTED') {
                    return res.status(403).json({
                        message: "Your registration was rejected by an admin."
                    });
                }
            }
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login User Error:", error);

        res.status(500).json({
            message: "Error logging in",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL USERS
// ======================================================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ["password_hash"]
            }
        });

        res.status(200).json({
            message: "Users fetched successfully",
            users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
};


// ======================================================
// GET USER BY ID
// ======================================================
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: {
                exclude: ["password_hash"]
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get User By ID Error:", error);

        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        });
    }
};


// ======================================================
// Update user
// ======================================================

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { email, password, role } = req.body;

        // Check whether email is being changed
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                where: { email }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            user.email = email;
        }

        // Update role
        if (role) {
            user.role = role;
        }

        // Update password
        if (password) {
            user.password_hash = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        });

    } catch (error) {
        console.error("Update User Error:", error);

        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
};



// DELETE USER
// ======================================================
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await user.destroy();

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        res.status(500).json({
            message: "Error deleting user",
            error: error.message
        });
    }
}

// EXPORT CONTROLLERS

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};