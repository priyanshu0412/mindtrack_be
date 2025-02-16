require("dotenv").config();
const jwt = require("jsonwebtoken");

// -------------------------------------

module.exports.createSecretToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
