const { Signup, Login, Logout, verifyOTP, resendOTP } = require("../controller/authController");
const verifyToken = require("../middleware/verifyToken");
// const verifyToken = require("../utils/verifyToken");
const authRouter = require("express").Router();

authRouter.post("/signup", Signup);
authRouter.post("/login", Login);
authRouter.post("/logout", Logout);
authRouter.post("/verify-otp", verifyToken, verifyOTP);
authRouter.post("/resend-otp", resendOTP);

module.exports = authRouter;