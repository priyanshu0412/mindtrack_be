const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const DBConnection = require("./db");
const authRouter = require("./routes/authRoute");
const verifyToken = require("./middleware/verifyToken");
const todoRouter = require("./routes/todoRoute");
const diaryRoute = require("./routes/diaryRoute");
const { DB_CONNECT_ERROR } = require("./helpers/constant");

const app = express();
const PORT = process.env.PORT || 8000;

// -----------------------------------------------
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);
app.use(cookieParser());

// -----------------------------------------------
// Database Connection
DBConnection()
    .catch((error) => {
        console.error(DB_CONNECT_ERROR, error);
    });

// -----------------------------------------------
// Routes
app.use("/auth", authRouter);
app.use("/api/todo", verifyToken, todoRouter);
app.use("/api/diary", verifyToken, diaryRoute);
app.get("/", (req, res) => {
    res.send("get method")
})

// -----------------------------------------------
// Server Initialization
app.listen(PORT, () => {
    console.log(`Server is started on http://localhost:${PORT}`);
});
