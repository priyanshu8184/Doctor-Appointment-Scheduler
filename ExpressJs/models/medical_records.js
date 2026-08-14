const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const MedicalRecord = sequelize.define('MedicalRecord', {
    record_id: {
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

    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'appointments',
            key: 'appointment_id'
        }
    },

    clinical_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    date_recorded: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'medical_records',
    timestamps: false
});

module.exports=MedicalRecord;