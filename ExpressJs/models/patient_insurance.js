const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const PatientInsurance = sequelize.define('PatientInsurance', {
    insurance_id: {
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
        },
        onDelete: 'CASCADE'
    },

    provider_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    policy_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },

    eligibility_status: {
        type: DataTypes.ENUM(
            'VERIFIED',
            'PENDING',
            'REJECTED'
        ),
        defaultValue: 'PENDING'
    },

    co_pay_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'patient_insurance',
    timestamps: false
});

module.exports=PatientInsurance;