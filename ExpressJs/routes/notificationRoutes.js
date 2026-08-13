const express = require("express");
const router = express.Router();

const {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification
} = require("../controllers/notificationController");

// Create notification
router.post("/", createNotification);

// Get notifications of a user
router.get("/user/:user_id", getUserNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
