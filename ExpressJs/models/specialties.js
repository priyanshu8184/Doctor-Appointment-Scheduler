const{DataTypes}= require("sequelize")
const sequelize= require("../config/db")

const Specialty = sequelize.define('Specialty', {
    specialty_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'specialties',
    timestamps: false
});
module.exports=Specialty;