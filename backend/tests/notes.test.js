import { randomUUID } from "node:crypto";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

const withContext = (label, err) => {
  err.message = `[${label}] ${err.message}`;
  throw err;
};

describe("Notes API", () => {
  const userId = randomUUID();
  const otherUserId = randomUUID();
  let noteId;

  before(async () => {
    try {
      await pool.query(
        "INSERT INTO users (id, first_name, last_name, email, password) VALUES ($1, 'Notes', 'Tester', $2, 'x'), ($3, 'Other', 'Tester', $4, 'x')",
        [userId, `notes-test-${userId}@example.com`, otherUserId, `notes-test-${otherUserId}@example.com`],
      );
    } catch (err) {
      withContext("before hook: seed test users", err);
    }
  });

  after(async () => {
    try {
      await pool.query("DELETE FROM notes WHERE user_id = ANY($1::uuid[])", [[userId, otherUserId]]);
      await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [[userId, otherUserId]]);
    } catch (err) {
      withContext("after hook: clean up test users/notes", err);
    }
  });

  it("returns 400 when required fields are missing", async () => {
    try {
      const res = await request(app).post("/notes").send({ title: "No content" });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("title, content and user_id are required.");
    } catch (err) {
      withContext("returns 400 when required fields are missing", err);
    }
  });

  it("creates a note", async () => {
    try {
      const res = await request(app)
        .post("/notes")
        .send({ title: "Test Note", content: "Hello world", user_id: userId });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.include({ title: "Test Note", content: "Hello world", user_id: userId });

      noteId = res.body.data.id;
    } catch (err) {
      withContext("creates a note", err);
    }
  });

  it("lists notes for a user", async () => {
    try {
      const res = await request(app).get(`/notes/${userId}`);

      expect(res.status).to.equal(200);
      expect(res.body.count).to.equal(1);
      expect(res.body.data[0].id).to.equal(noteId);
    } catch (err) {
      withContext("lists notes for a user", err);
    }
  });

  it("gets a note by id", async () => {
    try {
      const res = await request(app).get(`/notes/${userId}/${noteId}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(noteId);
    } catch (err) {
      withContext("gets a note by id", err);
    }
  });

  it("returns 404 when fetching a note owned by a different user", async () => {
    try {
      const res = await request(app).get(`/notes/${otherUserId}/${noteId}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when fetching a note owned by a different user", err);
    }
  });

  it("updates a note", async () => {
    try {
      const res = await request(app)
        .put(`/notes/${noteId}`)
        .send({ title: "Updated Title", content: "Updated content", user_id: userId });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.include({ title: "Updated Title", content: "Updated content" });
    } catch (err) {
      withContext("updates a note", err);
    }
  });

  it("returns 404 when updating a note that does not exist", async () => {
    try {
      const res = await request(app)
        .put(`/notes/${randomUUID()}`)
        .send({ title: "x", content: "y", user_id: userId });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when updating a note that does not exist", err);
    }
  });

  it("returns 400 when deleting without a user_id", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).send({});

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("noteId and user_id are required.");
    } catch (err) {
      withContext("returns 400 when deleting without a user_id", err);
    }
  });

  it("returns 404 when deleting a note owned by a different user", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).send({ user_id: otherUserId });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when deleting a note owned by a different user", err);
    }
  });

  it("deletes a note", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).send({ user_id: userId });

      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(noteId);
    } catch (err) {
      withContext("deletes a note", err);
    }
  });

  it("returns 404 when deleting a note that no longer exists", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).send({ user_id: userId });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when deleting a note that no longer exists", err);
    }
  });
});
