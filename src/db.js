const mongoose = require("mongoose");
require("dotenv").config()

const DBConnection = async () => {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("Connection With Database Successfully")
}

module.exports = DBConnection