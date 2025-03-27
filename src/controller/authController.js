const { createSecretToken } = require("../utils/jwtToken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const sendResponse = require("../helpers/sendResponse");
const jwt = require("jsonwebtoken");

const {
    USER_EXIST,
    USER_SIGNUP_SUCCESSFULLY,
    INTERNAL_SERVER_ERROR,
    USER_NOT_FOUND_WITH_THIS_EMAIL,
    PASSWORD_IS_WRONG,
    LOGIN_SUCCESSFUL,
    GENERATE_OTP,
    UNAUTHORIZED_USER,
    INVALID_OTP,
    OTP_EXPIRE,
    OTP_AND_USER_VERIFIED,
    NEW_OTP_SENT,
    RESET_PASSWORD_LINK_SENT,
    PASSWORD_UPDATED_SUCCESSFULLY,
    INVALID_OR_EXPIRE_TOKEN
} = require("../helpers/constant");

const sendOTPEmail = require("../utils/sendingEmail");
const OTP = require("../models/otp");
const generateOTP = require("../utils/generateOTP");
const sendEmailResetPass = require("../utils/sendResetPassword");

// Signup - POST - "/signup"
const Signup = async (req, res) => {
    try {
        const { email, password, userName } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, null, USER_EXIST, true);
        }

        const user = await User.create({ email, password, userName });
        const token = createSecretToken(user._id, user?.email);

        res.cookie("authToken", token, {
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const otp = generateOTP(GENERATE_OTP);
        const expiresAt = new Date(Date.now() + 60 * 1000);

        await OTP.create({ email, otp, expiresAt });
        await sendOTPEmail(email, otp);

        user.password = undefined;
        sendResponse(res, 201, { user, token }, USER_SIGNUP_SUCCESSFULLY, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};

// Login - POST - "/login"
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return sendResponse(res, 400, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return sendResponse(res, 400, null, PASSWORD_IS_WRONG, true);
        }

        const token = createSecretToken(existingUser._id);
        res.cookie("authToken", token, {
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        sendResponse(res, 200, { existingUser, token }, LOGIN_SUCCESSFUL, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true, error);
    }
};

// Verify OTP - POST - "/verify-otp"
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!req.user || req.user.email !== email) {
            return sendResponse(res, 403, null, UNAUTHORIZED_USER, true);
        }

        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return sendResponse(res, 400, null, INVALID_OTP, true);
        }

        if (new Date() > otpRecord.expiresAt) {
            return sendResponse(res, 400, null, OTP_EXPIRE, true);
        }

        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return sendResponse(res, 404, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
        }

        sendResponse(res, 200, null, OTP_AND_USER_VERIFIED, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};

// Resend OTP - POST - "/resend-otp"
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        await OTP.deleteOne({ email });

        const otp = generateOTP(GENERATE_OTP);
        const expiresAt = new Date(Date.now() + 60 * 1000);

        await OTP.create({ email, otp, expiresAt });
        await sendOTPEmail(email, otp);

        sendResponse(res, 200, null, NEW_OTP_SENT, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};

// Forgot Password - POST - "/forgot-password"
const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return sendResponse(res, 400, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendEmailResetPass(email, resetLink);
        sendResponse(res, 200, null, RESET_PASSWORD_LINK_SENT, false);
    } catch (error) {
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};

// Reset Password - POST - "/reset-password"
const ResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOneAndUpdate(
            { _id: decoded.id },
            { $set: { password: hashedPassword } },
            { new: true, runValidators: true }
        );

        if (!user) {
            return sendResponse(res, 400, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
        }

        sendResponse(res, 200, null, PASSWORD_UPDATED_SUCCESSFULLY, false);
    } catch (error) {
        sendResponse(res, 400, null, INVALID_OR_EXPIRE_TOKEN, true);
    }
};

module.exports = {
    Signup,
    Login,
    verifyOTP,
    resendOTP,
    ForgotPassword,
    ResetPassword
};
