const express = require("express");
const DBConnection = require("./db");
const app = express();
const cors = require("cors");
require("dotenv").config()
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRoute");
const User = require("./models/user");
const verifyToken = require("./middleware/verifyToken");
const PORT = process.env.PORT || 8000
const cookieParser = require("cookie-parser");

// -----------------------------------------------

// Parsing Data & Cookie - CORS 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(cookieParser());


// DB Connection 
DBConnection().catch(() => {
    console.log("Getting Error While Connection to the Database`")
})

// Routes 
app.use("/api/auth", authRouter);

// Protected route for the dashboard
app.get("/dashboard", verifyToken, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: "Access Granted", users });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

// PORT Initialization 
app.listen(PORT, () => {
    console.log(`Server Started On http://localhost:${PORT}`)
})