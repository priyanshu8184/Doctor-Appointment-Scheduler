const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Waitlist = sequelize.define('Waitlist', {
    waitlist_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'doctor_id'
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

    requested_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM(
            'WAITING',
            'NOTIFIED',
            'BOOKED'
        ),
        defaultValue: 'WAITING'
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'waitlist',
    timestamps: false
});

module.exports=Waitlist;