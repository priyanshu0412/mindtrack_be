const express = require("express");
const DBConnection = require("./db");
const app = express();
const cors = require("cors");
require("dotenv").config()
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRoute");
const verifyToken = require("./middleware/verifyToken");
const PORT = process.env.PORT || 8000
const cookieParser = require("cookie-parser");
const dashboardRouter = require("./routes/dashboardRoute");

// -----------------------------------------------

// Parsing Data & Cookie - CORS 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: "http://localhost:3000",
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
app.use("/auth", authRouter);
app.use("/dashboard", verifyToken, dashboardRouter);


// PORT Initialization 
app.listen(PORT, () => {
    console.log(`Server Started On http://localhost:${PORT}`)
})