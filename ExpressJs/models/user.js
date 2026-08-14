const{DataTypes, ENUM}= require("sequelize")
const sequelize= require("../config/db")

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },

    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM(
            'ADMIN',
            'DOCTOR',
            'PATIENT'
        ),
        allowNull: false
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports=User;