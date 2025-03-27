const express = require("express");
const {
    createDiary,
    getDiary,
    getDiaryById,
    updateDiary,
    deleteDiary } = require("../controller/diaryController")

const diaryRoute = express.Router();

diaryRoute.post("/", createDiary);
diaryRoute.get("/", getDiary);
diaryRoute.get("/:id", getDiaryById);
diaryRoute.patch("/:id", updateDiary);
diaryRoute.delete("/:id", deleteDiary);

module.exports = diaryRoute;
