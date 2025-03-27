const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        dueDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const todoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        heading: {
            type: String
        },
        tasks: [taskSchema],
    },
    { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo
