const mongoose = require("mongoose");
require("dotenv").config();

const DBConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connection with database successful");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

module.exports = DBConnection;
