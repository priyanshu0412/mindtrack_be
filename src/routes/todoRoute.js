const express = require("express");
const { createTodo, getTodos, getTodoById, updateTodo, deleteTodo } = require("../controller/todoController");

const todoRouter = express.Router();

todoRouter.post("/", createTodo);
todoRouter.get("/", getTodos);
todoRouter.get("/:id", getTodoById);
todoRouter.patch("/:id",  updateTodo);
todoRouter.delete("/:id", deleteTodo);

module.exports = todoRouter;
