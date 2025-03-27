const Diary = require("../models/diary");

// 📌 Create a new Diary
const createDiary = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        const newNote = await Diary.create({ title, content, user: userId });
        res.status(201).json({ success: true, message: "Note created!", data: newNote });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📌 Get all diary of a user
const getDiary = async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await Diary.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📌 Get a single Diary by ID
const getDiaryById = async (req, res) => {
    try {
        const note = await Diary.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: "Note not found!" });

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📌 Update a note
const updateDiary = async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedNote = await Diary.findByIdAndUpdate(req.params.id, { title, content, updatedAt: Date.now() }, { new: true });

        if (!updatedNote) return res.status(404).json({ success: false, message: "Note not found!" });

        res.status(200).json({ success: true, message: "Note updated!", data: updatedNote });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📌 Delete a note
const deleteDiary = async (req, res) => {
    try {
        const deletedNote = await Diary.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({ success: false, message: "Note not found!" });

        res.status(200).json({ success: true, message: "Note deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    createDiary,
    getDiary,
    getDiaryById,
    updateDiary,
    deleteDiary
}