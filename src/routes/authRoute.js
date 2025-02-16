const {
    Signup,
    Login,
    verifyOTP,
    resendOTP,
    ForgotPassword,
    ResetPassword,
} = require("../controller/authController");

const verifyToken = require("../middleware/verifyToken");
const authRouter = require("express").Router();

authRouter.post("/signup", Signup);
authRouter.post("/login", Login);
authRouter.post("/verify-otp", verifyToken, verifyOTP);
authRouter.post("/resend-otp", resendOTP);
authRouter.post("/forgot-password", ForgotPassword);
authRouter.patch("/reset-password", ResetPassword);

module.exports = authRouter;