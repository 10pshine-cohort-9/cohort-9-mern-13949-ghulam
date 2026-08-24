import { Router } from "express";
import * as notesControllers from "../controllers/notes.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", notesControllers.createNote);

router.get("/", notesControllers.getNotes);

router.get("/:noteId", notesControllers.getNoteById);

router.put("/:noteId", notesControllers.updateNote);

router.delete("/:noteId", notesControllers.deleteNote);

export default router;
