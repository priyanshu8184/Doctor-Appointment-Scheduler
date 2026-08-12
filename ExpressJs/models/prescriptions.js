const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Prescription = sequelize.define('Prescription', {
    prescription_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'medical_records',
            key: 'record_id'
        },
        onDelete: 'CASCADE'
    },

    medication_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },

    dosage: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    issued_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'prescriptions',
    timestamps: false
});

module.exports=Prescription;