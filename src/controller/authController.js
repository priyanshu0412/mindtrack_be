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
    LOGOUT_SUCCESSFUL,
    GENERATE_OTP
} = require("../helpers/constant");
const sendOTPEmail = require("../utils/sendingEmail");
const OTP = require("../models/otp");
const generateOTP = require("../utils/generateOTP");

// ---------------------------------------------------
// Signup - POST - "/signup"
const Signup = async (req, res) => {
    try {
        const { email, password, confirmPassword, userName } = req.body;

        if (password !== confirmPassword) {
            return sendResponse(res, 400, null, PASSWORD_DOESNT_MATCH, true);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, null, USER_EXIST, true);
        }

        const user = await User.create({ email, password, userName, confirmPassword });

        // Generate a token
        const token = createSecretToken(user._id, user?.email);

        res.cookie("authToken", token, {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
        });

        const otp = generateOTP(GENERATE_OTP);
        // OTP expires in 60 seconds
        const expiresAt = new Date(Date.now() + 60 * 1000);

        // Store OTP in the database
        await OTP.create({ email, otp, expiresAt });

        // Send OTP email
        await sendOTPEmail(email, otp);

        sendResponse(res, 201, user, USER_SIGNUP_SUCCESSFULLY, false);
    } catch (error) {
        console.error("Error in Signup:", error);
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};

// ---------------------------------------------------
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
            return sendResponse(res, 400, null, PASSWORD_IS_WRONG, true);
        }

        // Generate a token
        const token = createSecretToken(existingUser._id);

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        const otp = generateOTP(GENERATE_OTP);
        // OTP expires in 60 seconds
        const expiresAt = new Date(Date.now() + 60 * 1000);

        // Store OTP in the database
        await OTP.create({ email, otp, expiresAt });

        // Send OTP email
        await sendOTPEmail(email, otp);

        // Send a success response
        sendResponse(res, 200, existingUser, LOGIN_SUCCESSFUL, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true, error);
    }
};

// ---------------------------------------------------
// Logout - POST - "/logout"
const Logout = (req, res) => {
    res.clearCookie('authToken');
    return sendResponse(res, 200, null, LOGOUT_SUCCESSFUL, false);
};


// ---------------------------------------------------
// Verify OTP - POST - "/verify-top" 
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    // Ensure user is authenticated by checking the decoded token
    if (!req.user || req.user.email !== email) {
        return sendResponse(res, 403, null, "Unauthorized", true);
    }

    // Check if OTP exists and has not expired
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        return sendResponse(res, 400, null, "Invalid OTP", true);
    }

    if (new Date() > otpRecord.expiresAt) {
        return sendResponse(res, 400, null, "OTP Expired", true);
    }

    // OTP is valid, proceed with user login or signup
    sendResponse(res, 200, null, "OTP Verified", false);
};



// ---------------------------------------------------
// Resending OTP - POST - "/resend-top" 
const resendOTP = async (req, res) => {
    const { email } = req.body;

    const existingOtp = await OTP.find({ email });
    if (existingOtp) {
        await OTP.deleteOne({ email });  // Remove old OTP
    }

    const otp = generateOTP(GENERATE_OTP);
    const expiresAt = new Date(Date.now() + 60 * 1000);  // 60 seconds expiration

    await OTP.create({ email, otp, expiresAt });

    await sendOTPEmail(email, otp);

    sendResponse(res, 200, null, "New OTP Sent", false);
};


module.exports = {
    Signup,
    Login,
    Logout,
    verifyOTP,
    resendOTP
};
