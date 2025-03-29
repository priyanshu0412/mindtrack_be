const Diary = require("../models/diary");
const {
    NOTE_CREATED,
    NOTE_NOT_FOUND,
    NOTE_UPDATED,
    NOTE_DELETED,
    TITLE_CONTENT_REQUIRED,
    DIARY_ID_REQ
} = require("../helpers/constant");

// Create a new Diary - POST  - "/api/diary"
const createDiary = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: TITLE_CONTENT_REQUIRED });
        }

        const userId = req.user.id;
        const newNote = await Diary.create({ title, content, user: userId });
        res.status(200).json({ success: true, message: NOTE_CREATED, data: newNote });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all diaries of a user - GET  - "/api/diary"
const getDiary = async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await Diary.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single Diary by ID - GET  - "/api/diary/:id"
const getDiaryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: DIARY_ID_REQ });
        }

        const note = await Diary.findById(id);
        if (!note) {
            return res.status(404).json({ success: false, message: NOTE_NOT_FOUND });
        }

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a Diary - PATCH  - "/api/diary"
const updateDiary = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: DIARY_ID_REQ });
        }
        if (!title || !content) {
            return res.status(400).json({ success: false, message: TITLE_CONTENT_REQUIRED });
        }

        const updatedNote = await Diary.findByIdAndUpdate(
            id,
            { title, content, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ success: false, message: NOTE_NOT_FOUND });
        }

        res.status(200).json({ success: true, message: NOTE_UPDATED, data: updatedNote });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a Diary - DELETE  - "/api/diary/:id"
const deleteDiary = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: DIARY_ID_REQ });
        }

        const deletedNote = await Diary.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ success: false, message: NOTE_NOT_FOUND });
        }

        res.status(200).json({ success: true, message: NOTE_DELETED });
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
};