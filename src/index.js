const express = require("express")
const app = express();
require("dotenv").config()


// PORT Initialization 
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server Started On http://localhost:${PORT}`)
})