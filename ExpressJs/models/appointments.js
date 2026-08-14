const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Appointment = sequelize.define('Appointment', {
    appointment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'patient_id'
        }
    },

    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'doctor_id'
        }
    },

    appointment_datetime: {
        type: DataTypes.DATE,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM(
            'SCHEDULED',
            'ACCEPTED',
            'REJECTED',
            'COMPLETED',
            'CANCELLED',
            'NO_SHOW'
        ),
        defaultValue: 'SCHEDULED'
    },

    telemedicine_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    appointment_type: {
        type: DataTypes.ENUM('MESSAGING', 'AUDIO', 'VIDEO'),
        allowNull: false,
        defaultValue: 'VIDEO'
    },

    calendar_sync_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'appointments',
    timestamps: false
});
module.exports=Appointment;