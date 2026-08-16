const { Sequelize } = require("sequelize");

// Determine dialect from environment variable (default to 'mysql')
const dialect = process.env.db_dialect || 'mysql';

let sequelize;

if (process.env.DATABASE_URL) {
    // For deployments (like Render) that use a single connection string
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: dialect,
        dialectOptions: dialect === 'postgres' ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    });
} else {
    // For local development or separate env variables
    sequelize = new Sequelize(
        process.env.db_name,
        process.env.db_user,
        process.env.db_password,
        {
            host: process.env.db_host,
            dialect: dialect,
            dialectOptions: dialect === 'postgres' ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : {}
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("connected to database");

        await sequelize.sync();
        console.log("all model synchronised");

    } catch (error) {
        console.log("error connecting to database");
        console.log(error.message);
        process.exit(1);
    }
};

module.exports = sequelize;
module.exports.connectDB = connectDB;
