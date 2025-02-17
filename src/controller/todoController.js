const Todo = require("../models/todo")

// Create To-Do - POST - /api/todo/
const createTodo = async (req, res) => {
    try {
        const { heading, tasks } = req.body;
        const todo = new Todo({
            user: req.user.id,
            heading,
            tasks,
        });

        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get All To-Dos for a User
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Single To-Do by ID
const getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ error: "To-Do not found" });

        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update To-Do (PATCH)
const updateTodo = async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedTodo) return res.status(404).json({ error: "To-Do not found" });

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Delete To-Do
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) return res.status(404).json({ error: "To-Do not found" });

        res.json({ message: "To-Do deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo
};
