const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Doctor = sequelize.define('Doctor', {
    doctor_id: {
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

    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    specialization: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    certificate: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    education: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    experience: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    consultation_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'doctors',
    timestamps: false
});
module.exports=Doctor;