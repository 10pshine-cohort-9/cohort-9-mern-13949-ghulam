import { randomUUID } from "node:crypto";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Notes API", () => {
  const userId = randomUUID();
  const otherUserId = randomUUID();
  let noteId;

  before(async () => {
    await pool.query(
      "INSERT INTO users (id, first_name, last_name, email, password) VALUES ($1, 'Notes', 'Tester', $2, 'x'), ($3, 'Other', 'Tester', $4, 'x')",
      [userId, `notes-test-${userId}@example.com`, otherUserId, `notes-test-${otherUserId}@example.com`],
    );
  });

  after(async () => {
    await pool.query("DELETE FROM notes WHERE user_id = ANY($1::uuid[])", [[userId, otherUserId]]);
    await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [[userId, otherUserId]]);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/notes").send({ title: "No content" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("title, content and user_id are required.");
  });

  it("creates a note", async () => {
    const res = await request(app)
      .post("/notes")
      .send({ title: "Test Note", content: "Hello world", user_id: userId });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.include({ title: "Test Note", content: "Hello world", user_id: userId });

    noteId = res.body.data.id;
  });

  it("lists notes for a user", async () => {
    const res = await request(app).get(`/notes/user/${userId}`);

    expect(res.status).to.equal(200);
    expect(res.body.count).to.equal(1);
    expect(res.body.data[0].id).to.equal(noteId);
  });

  it("gets a note by id", async () => {
    const res = await request(app).get(`/notes/${userId}/${noteId}`);

    expect(res.status).to.equal(200);
    expect(res.body.data.id).to.equal(noteId);
  });

  it("returns 404 when fetching a note owned by a different user", async () => {
    const res = await request(app).get(`/notes/${otherUserId}/${noteId}`);

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Note not found.");
  });

  it("updates a note", async () => {
    const res = await request(app)
      .put(`/notes/${noteId}`)
      .send({ title: "Updated Title", content: "Updated content", user_id: userId });

    expect(res.status).to.equal(200);
    expect(res.body.data).to.include({ title: "Updated Title", content: "Updated content" });
  });

  it("returns 404 when updating a note that does not exist", async () => {
    const res = await request(app)
      .put(`/notes/${randomUUID()}`)
      .send({ title: "x", content: "y", user_id: userId });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Note not found.");
  });

  it("deletes a note", async () => {
    const res = await request(app).delete(`/notes/${noteId}`);

    expect(res.status).to.equal(200);
    expect(res.body.data.id).to.equal(noteId);
  });

  it("returns 404 when deleting a note that no longer exists", async () => {
    const res = await request(app).delete(`/notes/${noteId}`);

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Note not found.");
  });
});
