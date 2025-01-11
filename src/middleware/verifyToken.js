const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sendResponse = require("../helpers/sendResponse");
const {
    ACCESS_DENIED_TOKEN,
    ACCESS_DENIED_USER,
    INVALID_EXPIRE_TOKEN
} = require("../helpers/constant");

// ----------------------------------------------

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return sendResponse(res, 401, null, ACCESS_DENIED_TOKEN, true);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return sendResponse(res, 401, null, ACCESS_DENIED_USER, true);
        }

        req.user = user;
        next();
    } catch (error) {
        return sendResponse(res, 403, null, INVALID_EXPIRE_TOKEN, true);
    }
};

module.exports = verifyToken;
