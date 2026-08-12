const{DataTypes, ENUM}= require("sequelize")
const sequelize= require("../config/db")

const Users= sequelize.define("Users",{
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
       unique:true 
    },
    password_hash:{
        type:DataTypes.STRING,
        allowNull:false
    },
    role: {
        type: ENUM,
        values: ['Admin', 'Doctor', 'Patient'],
        allowNull:false
    },
    created_at:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    updated_at:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }

})

module.exports=Users;