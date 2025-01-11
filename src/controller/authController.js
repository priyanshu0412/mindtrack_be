const { createSecretToken } = require("../utils/jwtToken");
const User = require("../models/user");
const bcrypt = require("bcrypt")
const sendResponse = require("../helpers/sendResponse");
const {
    USER_EXIST,
    PASSWORD_DOESNT_MATCH,
    USER_SIGNUP_SUCCESSFULLY,
    INTERNAL_SERVER_ERROR,
    USER_NOT_FOUND_WITH_THIS_EMAIL,
    PASSWORD_IS_WRONG,
    LOGIN_SUCCESSFUL,
    LOGOUT_SUCCESSFUL
} = require("../helpers/constant");


// Signup - POST - "/signup"
const Signup = async (req, res) => {
    try {
        // Extract Data From the Body 
        const { email, password, confirmPassword, userName } = req.body;

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return sendResponse(res, 400, null, PASSWORD_DOESNT_MATCH, true);

        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, null, USER_EXIST, true);
        }

        // Create new user
        const user = await User.create({ email, password, userName, confirmPassword });

        // Generate token
        const token = createSecretToken(user._id);

        // Send the token as a cookie
        res.cookie("authToken", token, {
            withCredentials: true,
            httpOnly: false,
        });
        sendResponse(res, 201, user, USER_SIGNUP_SUCCESSFULLY, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};

// Login - POST - "/login"
const Login = async (req, res) => {
    try {
        // Extract data from the request body
        const { email, password } = req.body;

        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return sendResponse(res, 400, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            // return sendResponse(res, 400, null, "User Password is Wrong");
            return sendResponse(res, 400, null, PASSWORD_IS_WRONG, true);
        }

        // Generate a token
        const token = createSecretToken(existingUser._id);

        // Set the token in an HTTP-only cookie
        res.cookie("authToken", token, {
            httpOnly: true, // Prevent access from JavaScript
            secure: true, // Only send over HTTPS (set false for development)
            sameSite: "strict", // Mitigates CSRF attacks
        });

        // Send a success response
        sendResponse(res, 200, existingUser, LOGIN_SUCCESSFUL, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true, error);
    }
};

// Logout - POST - "/logout"
const Logout = (req, res) => {
    res.clearCookie('authToken');
    return sendResponse(res, 200, null, LOGOUT_SUCCESSFUL, false);
};

module.exports = {
    Signup,
    Login,
    Logout
};
