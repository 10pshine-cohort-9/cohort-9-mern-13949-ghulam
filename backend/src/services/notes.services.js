import { randomUUID } from "node:crypto";
import { pool } from "../config/db.js";
import HttpError from "../utils/httpError.js";

const createNote = async (title, content, user_id) => {
  const id = randomUUID();

  const result = await pool.query(
    `
      INSERT INTO notes (id, title, content, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [id, title, content, user_id],
  );

  return result.rows[0];
};

const deleteNote = async (noteId) => {
  const result = await pool.query(
    `
      DELETE FROM notes
      WHERE id = $1
      RETURNING *;
    `,
    [noteId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Note not found.");
  }

  return result.rows[0];
};

const getNotes = async (user_id) => {
  const result = await pool.query(
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
  const result = await pool.query(
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

const updateNote = async (noteId, title, content, user_id) => {
  const result = await pool.query(
    `
      UPDATE notes
      SET
        title = $1,
        content = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
        AND user_id = $4
      RETURNING *;
    `,
    [title, content, noteId, user_id],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Note not found.");
  }

  return result.rows[0];
};

export {createNote, deleteNote, getNotes, getNoteById, updateNote}
