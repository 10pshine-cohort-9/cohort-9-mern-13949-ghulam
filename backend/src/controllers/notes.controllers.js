import * as notesServices from "../services/notes.services.js";

const createNote = async (req, res, next) => {
  try {
    const { title, content, user_id } = req.body;

    if (!title || !content || !user_id) {
      return res.status(400).json({
        message: "title, content and user_id are required.",
      });
    }

    const note = await notesServices.createNote(title, content, user_id);

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const notes = await notesServices.getNotes(user_id);

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const { user_id, noteId } = req.params;

    if (!user_id || !noteId) {
      return res.status(400).json({
        message: "User ID and Note ID are required.",
      });
    }

    const note = await notesServices.getNoteById(user_id, noteId);

    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { title, content, user_id } = req.body;

    if (!noteId || !title || !content || !user_id) {
      return res.status(400).json({
        message: "noteId, title, content and user_id are required.",
      });
    }

    const note = await notesServices.updateNote(noteId, title, content, user_id);

    return res.status(200).json({
      success: true,
      message: "Note updated successfully.",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { user_id } = req.body;

    if (!noteId || !user_id) {
      return res.status(400).json({
        message: "noteId and user_id are required.",
      });
    }

    const note = await notesServices.deleteNote(noteId, user_id);

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export { createNote, deleteNote, getNotes, getNoteById, updateNote };