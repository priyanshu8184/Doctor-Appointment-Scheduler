const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")


const DoctorSpecialty = sequelize.define('DoctorSpecialty', {
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'doctors',
            key: 'doctor_id'
        },
        onDelete: 'CASCADE'
    },

    specialty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'specialties',
            key: 'specialty_id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'doctor_specialties',
    timestamps: false
});
module.exports=DoctorSpecialty;