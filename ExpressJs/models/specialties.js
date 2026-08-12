const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Specialties= sequelize.define("Specialties",{
    specialty_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING
    }
})
module.exports=Specialties;