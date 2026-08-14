const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const DoctorAvailability = sequelize.define('DoctorAvailability', {
    availability_id: {
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
        },
        onDelete: 'CASCADE'
    },

    day_of_week: {
        type: DataTypes.ENUM(
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY'
        ),
        allowNull: true
    },

    start_time: {
        type: DataTypes.TIME,
        allowNull: true
    },

    end_time: {
        type: DataTypes.TIME,
        allowNull: true
    },

    slot_duration_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },

    specific_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'doctor_availability',
    timestamps: false
});
module.exports=DoctorAvailability;