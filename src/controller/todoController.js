const Todo = require("../models/todo");

// Create To-Do - POST - /api/todo/
const createTodo = async (req, res) => {
    try {
        const { heading, tasks } = req.body;

        // Validate input
        if (!heading || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ error: "Heading and tasks are required" });
        }

        const todo = new Todo({
            user: req.user.id,
            heading,
            tasks,
        });

        await todo.save();
        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

// Get All To-Dos for a User - GET - /api/todo/
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).populate("user", "name email");
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

    // Get Single To-Do by ID - GET - /api/todo/:id
    const getTodoById = async (req, res) => {
        try {
            const todo = await Todo.findById(req.params.id);
            if (!todo) return res.status(404).json({ error: "To-Do not found" });

            // Ensure the user can only access their own To-Dos
            if (todo.user.toString() !== req.user.id) {
                return res.status(403).json({ error: "Unauthorized access" });
            }

            res.json(todo);
        } catch (error) {
            res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    };

// Update To-Do - PATCH - /api/todo/:id
const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ error: "To-Do not found" });

        // Ensure only owner can update
        if (todo.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

// Delete To-Do - DELETE - /api/todo/:id
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ error: "To-Do not found" });

        // Ensure only owner can delete
        if (todo.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: "To-Do deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo
};
