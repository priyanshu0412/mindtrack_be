const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const DBConnection = require("./db");
const authRouter = require("./routes/authRoute");
const dashboardRouter = require("./routes/dashboardRoute");
const verifyToken = require("./middleware/verifyToken");

const app = express();
const PORT = process.env.PORT || 8000;

// -----------------------------------------------
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);
app.use(cookieParser());

// -----------------------------------------------
// Database Connection
DBConnection()
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

// -----------------------------------------------
// Routes
app.use("/auth", authRouter);
app.use("/dashboard", verifyToken, dashboardRouter);

// -----------------------------------------------
// Server Initialization
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
