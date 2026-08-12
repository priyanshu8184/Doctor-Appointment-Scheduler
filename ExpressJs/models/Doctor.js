const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Doctors= sequelize.define("Doctors",{
    doctor_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    first_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    last_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    bio:{
        type:DataTypes.STRING
    },
    location:{
        type:DataTypes.STRING
    },
    consultation_fee:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    user_id: {
    type: DataTypes.INTEGER,
    references: {
        model: 'users',
        key: 'user_id'
    },
    onDelete: 'CASCADE'
    }    
})
module.exports=Doctors;