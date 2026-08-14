require("dotenv").config();
const sequelize = require("./config/db");

async function alterTable() {
    try {
        await sequelize.query("ALTER TABLE doctors ADD COLUMN profile_picture VARCHAR(255);");
        console.log("Added to doctors");
    } catch (e) {
        console.log("Doctors:", e.message);
    }
    
    try {
        await sequelize.query("ALTER TABLE patients ADD COLUMN profile_picture VARCHAR(255);");
        console.log("Added to patients");
    } catch (e) {
        console.log("Patients:", e.message);
    }

    process.exit();
}
alterTable();
