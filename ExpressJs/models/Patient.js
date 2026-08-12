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
    }
}, {
    tableName: 'patients',
    timestamps: false
});
module.exports=Patient;