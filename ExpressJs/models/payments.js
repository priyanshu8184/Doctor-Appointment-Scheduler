const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Payment = sequelize.define('Payment', {
    payment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'appointments',
            key: 'appointment_id'
        }
    },

    stripe_transaction_id: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true
    },

    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    payment_type: {
        type: DataTypes.ENUM(
            'FULL_FEE',
            'CO_PAY'
        ),
        allowNull: false
    },

    payment_status: {
        type: DataTypes.ENUM(
            'PENDING',
            'COMPLETED',
            'REFUNDED',
            'FAILED'
        ),
        defaultValue: 'PENDING'
    },

    refunded_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'payments',
    timestamps: false
});

module.exports=Payment;