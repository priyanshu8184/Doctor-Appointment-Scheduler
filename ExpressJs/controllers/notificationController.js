const { Notification, User } = require("../models");

// Allowed notification types
const ALLOWED_TYPES = [
    "REMINDER",
    "CANCELLATION",
    "REFUND",
    "WAITLIST_ALERT"
];

// ======================================================
// CREATE NOTIFICATION
// ======================================================
const createNotification = async (req, res) => {
    try {
        const {
            user_id,
            type,
            message,
            is_read
        } = req.body;

        // Required fields
        if (!user_id || !type || !message) {
            return res.status(400).json({
                message: "user_id, type and message are required"
            });
        }

        // Check user exists
        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Validate notification type
        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({
                message:
                    "Invalid type. Allowed values: REMINDER, CANCELLATION, REFUND, WAITLIST_ALERT"
            });
        }

        // Create notification
        const notification = await Notification.create({
            user_id,
            type,
            message,
            is_read:
                is_read !== undefined
                    ? is_read
                    : false
        });

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.error("Create Notification Error:", error);

        res.status(500).json({
            message: "Error creating notification",
            error: error.message
        });
    }
};


// ======================================================
// GET USER NOTIFICATIONS
// ======================================================
const getUserNotifications = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check user exists
        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const notifications = await Notification.findAll({
            where: {
                user_id
            },
            order: [
                ["created_at", "DESC"]
            ]
        });

        res.status(200).json({
            message: "User notifications fetched successfully",
            notifications
        });

    } catch (error) {
        console.error("Get User Notifications Error:", error);

        res.status(500).json({
            message: "Error fetching notifications",
            error: error.message
        });
    }
};


// ======================================================
// MARK NOTIFICATION AS READ
// ======================================================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        notification.is_read = true;

        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error("Mark As Read Error:", error);

        res.status(500).json({
            message: "Error marking notification as read",
            error: error.message
        });
    }
};


// ======================================================
// DELETE NOTIFICATION
// ======================================================
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        await notification.destroy();

        res.status(200).json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error("Delete Notification Error:", error);

        res.status(500).json({
            message: "Error deleting notification",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification
};
