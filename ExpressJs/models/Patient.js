const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Patients= sequelize.define("Patients",{
    patient_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    first_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    last_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    date_of_birth:{
        type:DataTypes.DATE,
        allowNull:false
    },

    phone_number:{
        type:DataTypes.STRING,
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
module.exports=Patients;