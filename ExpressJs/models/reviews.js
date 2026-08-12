const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Review = sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    appointment_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: {
            model: 'appointments',
            key: 'appointment_id'
        }
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

    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    },

    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'reviews',
    timestamps: false
});
module.exports=Review;
