import { randomUUID } from "node:crypto";
import { pool } from "../config/db.js";
import HttpError from "../utils/httpError.js";

const INVALID_UUID_CODE = "22P02";

const runQuery = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (err.code === INVALID_UUID_CODE) {
      throw new HttpError(400, "Invalid id format.");
    }
    throw err;
  }
};

const DEFAULT_NOTE_COLOR = "#c3c6d7";

const createNote = async (title, content, user_id, color) => {
  const id = randomUUID();

  const result = await runQuery(
    `
      INSERT INTO notes (id, title, content, user_id, color)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [id, title, content, user_id, color || DEFAULT_NOTE_COLOR],
  );

  return result.rows[0];
};

const deleteNote = async (noteId, user_id) => {
  const result = await runQuery(
    `
      DELETE FROM notes
      WHERE id = $1
        AND user_id = $2
      RETURNING *;
    `,
    [noteId, user_id],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Note not found.");
  }

  return result.rows[0];
};

const getNotes = async (user_id) => {
  const result = await runQuery(
    `
      SELECT *
      FROM notes
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `,
    [user_id],
  );

  return result.rows;
};

const getNoteById = async (user_id, noteId) => {
  const result = await runQuery(
    `
      SELECT *
      FROM notes
      WHERE user_id = $1
        AND id = $2;
    `,
    [user_id, noteId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Note not found.");
  }

  return result.rows[0];
};

const updateNote = async (noteId, title, content, user_id, color) => {
  const result = await runQuery(
    `
      UPDATE notes
      SET
        title = $1,
        content = $2,
        color = COALESCE($3, color),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
        AND user_id = $5
      RETURNING *;
    `,
    [title, content, color, noteId, user_id],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Note not found.");
  }

  return result.rows[0];
};

export { createNote, deleteNote, getNotes, getNoteById, updateNote };
