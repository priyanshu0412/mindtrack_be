const { Signup, Login, Logout, verifyOTP, resendOTP } = require("../controller/authController");
const authRouter = require("express").Router();

authRouter.post("/signup", Signup);
authRouter.post("/login", Login);
authRouter.post("/logout", Logout);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/resend-otp", resendOTP);

module.exports = authRouter;