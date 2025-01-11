const User = require("../models/user");

// ---------------------------------------

const Dashboard = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: "Access Granted", users });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

module.exports = {
    Dashboard
}