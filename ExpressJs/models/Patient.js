const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Patient = sequelize.define('Patient', {
    patient_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },

    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    gender: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    blood_group: {
        type: DataTypes.STRING(5),
        allowNull: true
    },

    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    emergency_contact: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'patients',
    timestamps: false
});
module.exports=Patient;