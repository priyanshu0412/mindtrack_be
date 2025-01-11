const { Signup, Login, Logout } = require("../controller/authController");
const authRouter = require("express").Router();

authRouter.post("/signup", Signup);
authRouter.post("/login", Login);
authRouter.post("/logout", Logout);

module.exports = authRouter;