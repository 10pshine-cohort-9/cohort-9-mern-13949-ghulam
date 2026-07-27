import { Router } from "express";
import * as notesControllers from "../controllers/notes.controllers.js";

const router = Router();

router.post("/", notesControllers.createNote);

router.get("/user/:user_id", notesControllers.getNotes);

router.get("/:user_id/:noteId", notesControllers.getNoteById);

router.put("/:noteId", notesControllers.updateNote);

router.delete("/:noteId", notesControllers.deleteNote);

export default router;