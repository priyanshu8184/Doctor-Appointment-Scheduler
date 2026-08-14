const Message = require("../models/Message");
const User = require("../models/user");

// Fetch chat history for an appointment
const getMessagesByAppointmentId = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        Message.belongsTo(User, { foreignKey: 'sender_id' });
        
        const messages = await Message.findAll({
            where: { appointment_id: appointmentId },
            order: [['created_at', 'ASC']],
            include: [{
                model: User,
                attributes: ['email']
            }]
        });

        res.status(200).json({
            message: "Messages fetched successfully",
            messages
        });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({
            message: "Error fetching messages",
            error: error.message
        });
    }
};

module.exports = {
    getMessagesByAppointmentId
};
