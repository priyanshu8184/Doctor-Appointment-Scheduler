require("dotenv").config();
const sequelize = require("./config/db");

async function alterTable() {
    const columns = [
        "ALTER TABLE doctors ADD COLUMN education VARCHAR(255);",
        "ALTER TABLE doctors ADD COLUMN phone_number VARCHAR(20);",
        "ALTER TABLE doctors ADD COLUMN experience VARCHAR(50);"
    ];

    for (let query of columns) {
        try {
            await sequelize.query(query);
            console.log(`Executed: ${query}`);
        } catch (e) {
            console.log(`Failed for ${query}:`, e.message);
        }
    }

    process.exit();
}
alterTable();
