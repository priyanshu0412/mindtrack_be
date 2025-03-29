const Todo = require("../models/todo");
const {
    HEADING_TASK_REQ,
    INTERNAL_SERVER_ERROR,
    TODO_NOT_FOUND,
    HEADING_MUST_STRING,
    TASK_MUST_NOT_EMPTY_ARRAY,
    TODO_DELETE_SUCCESSFULLY
} = require("../helpers/constant");

// Create To-Do - POST - /api/todo/
const createTodo = async (req, res) => {
    try {
        const { heading, tasks } = req.body;

        // Validate input
        if (!heading || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ error: HEADING_TASK_REQ });
        }

        const todo = new Todo({
            user: req.user.id,
            heading,
            tasks,
        });

        await todo.save();
        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message || INTERNAL_SERVER_ERROR });
    }
};

// Get All To-Dos for a User - GET - /api/todo/
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message || INTERNAL_SERVER_ERROR });
    }
};

// Get Single To-Do by ID - GET - /api/todo/:id
const getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ error: TODO_NOT_FOUND });

        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message || INTERNAL_SERVER_ERROR });
    }
};

// Update To-Do - PATCH - /api/todo/:id
const updateTodo = async (req, res) => {
    try {
        const { heading, tasks } = req.body;

        // Validate input
        if (heading && typeof heading !== "string") {
            return res.status(400).json({ error: HEADING_MUST_STRING });
        }
        if (tasks && (!Array.isArray(tasks) || tasks.length === 0)) {
            return res.status(400).json({ error: TASK_MUST_NOT_EMPTY_ARRAY });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedTodo) return res.status(404).json({ error: TODO_NOT_FOUND });

        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ error: error.message || INTERNAL_SERVER_ERROR });
    }
};

// Delete To-Do - DELETE - /api/todo/:id
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) return res.status(404).json({ error: TODO_NOT_FOUND });

        res.status(200).json({ message: TODO_DELETE_SUCCESSFULLY });
    } catch (error) {
        res.status(500).json({ error: error.message || INTERNAL_SERVER_ERROR });
    }
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
};
