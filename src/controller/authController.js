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
const jwt = require("jsonwebtoken");
const sendEmailResetPass = require("../utils/sendResetPassword");

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

        user.password = undefined

        sendResponse(res, 201, user, USER_SIGNUP_SUCCESSFULLY, false);
    } catch (error) {
        console.error("Error in Signup:", error);
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

        const otp = generateOTP(GENERATE_OTP);

        const expiresAt = new Date(Date.now() + 60 * 1000);


        await OTP.create({ email, otp, expiresAt });


        await sendOTPEmail(email, otp);


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

    try {
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
        console.error(error);
        sendResponse(res, 500, null, INTERNAL_SERVER_ERROR, true);
    }
};



// ---------------------------------------------------
// Resending OTP - POST - "/resend-top" 
const resendOTP = async (req, res) => {
    const { email } = req.body;

    const existingOtp = await OTP.find({ email });
    if (existingOtp) {
        await OTP.deleteOne({ email });
    }

    const otp = generateOTP(GENERATE_OTP);
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await OTP.create({ email, otp, expiresAt });

    await sendOTPEmail(email, otp);

    sendResponse(res, 200, null, NEW_OTP_SENT, false);
};

// Forgot Password
const ForgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return sendResponse(res, 400, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
    }

    const resetToken = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const resetMessage = `Click here to reset your password: ${resetLink}`;
    await sendEmailResetPass(email, resetMessage);

    sendResponse(res, 200, null, RESET_PASSWORD_LINK_SENT, false);
};


// Reset Password
const ResetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("decoded", decoded)

        const user = await User.findOne({ _id: decoded.id });
        if (!user) {
            return sendResponse(res, 400, null, USER_NOT_FOUND_WITH_THIS_EMAIL, true);
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.confirmPassword = await bcrypt.hash(newPassword, 10);
        await user.save();

        sendResponse(res, 200, null, PASSWORD_UPDATED_SUCCESSFULLY, false);

    } catch (error) {
        sendResponse(res, 400, null, INVALID_OR_EXPIRE_TOKEN, true);
    }
};

module.exports = {
    Signup,
    Login,
    Logout,
    verifyOTP,
    resendOTP,
    ForgotPassword,
    ResetPassword
};
