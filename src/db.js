const mongoose = require("mongoose");
const { DB_CONNECT_SUCCESSFULLY, DB_CONNECT_FAIL } = require("./helpers/constant");
require("dotenv").config();

const DBConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(DB_CONNECT_SUCCESSFULLY);
    } catch (error) {
        console.error(DB_CONNECT_FAIL, error);
        process.exit(1);
    }
};

module.exports = DBConnection;
