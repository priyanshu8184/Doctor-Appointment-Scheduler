const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define('Message', {
    message_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'appointments',
            key: 'appointment_id'
        },
        onDelete: 'CASCADE'
    },

    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },

    sender_role: {
        type: DataTypes.ENUM('PATIENT', 'DOCTOR'),
        allowNull: false
    },

    message_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'messages',
    timestamps: false
});

module.exports = Message;
