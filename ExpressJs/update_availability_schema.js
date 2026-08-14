require("dotenv").config();
const sequelize = require("./config/db");

async function alterTable() {
    try {
        await sequelize.query("ALTER TABLE doctor_availability MODIFY day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NULL;");
        console.log("Modified day_of_week to allow NULL");
    } catch (e) {
        console.log("Modify day_of_week error:", e.message);
    }
    
    try {
        await sequelize.query("ALTER TABLE doctor_availability MODIFY start_time TIME NULL;");
        console.log("Modified start_time to allow NULL");
    } catch (e) {
        console.log("Modify start_time error:", e.message);
    }
    
    try {
        await sequelize.query("ALTER TABLE doctor_availability MODIFY end_time TIME NULL;");
        console.log("Modified end_time to allow NULL");
    } catch (e) {
        console.log("Modify end_time error:", e.message);
    }

    try {
        await sequelize.query("ALTER TABLE doctor_availability ADD COLUMN specific_date DATE NULL;");
        console.log("Added specific_date");
    } catch (e) {
        console.log("Add specific_date error:", e.message);
    }

    try {
        await sequelize.query("ALTER TABLE doctor_availability ADD COLUMN is_available BOOLEAN DEFAULT TRUE;");
        console.log("Added is_available");
    } catch (e) {
        console.log("Add is_available error:", e.message);
    }

    process.exit();
}
alterTable();
