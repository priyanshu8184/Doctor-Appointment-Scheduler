const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const DoctorSpecialties= sequelize.define("DoctorSpecialties",{
    doctor_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    specialty_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    doctor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
        model: 'doctors',
        key: 'doctor_id'
    },
    onDelete: 'CASCADE'
},

specialty_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
        model: 'specialties',
        key: 'specialty_id'
    },
    onDelete: 'CASCADE'
}

})
module.exports=DoctorSpecialties;