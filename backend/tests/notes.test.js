import { randomUUID } from "node:crypto";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

const withContext = (label, err) => {
  err.message = `[${label}] ${err.message}`;
  throw err;
};

const signUp = async (label) => {
  const email = `notes-test-${label}-${randomUUID()}@example.com`;
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ firstName: "Notes", lastName: "Tester", email, password: "Password123!" });

  return { userId: res.body.user.id, token: res.body.token, email };
};

describe("Notes API", () => {
  let user;
  let otherUser;
  let noteId;

  before(async () => {
    try {
      user = await signUp("owner");
      otherUser = await signUp("other");
    } catch (err) {
      withContext("before hook: create test users", err);
    }
  });

  after(async () => {
    try {
      await pool.query("DELETE FROM notes WHERE user_id = ANY($1::uuid[])", [[user.userId, otherUser.userId]]);
      await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [[user.userId, otherUser.userId]]);
    } catch (err) {
      withContext("after hook: clean up test users/notes", err);
    }
  });

  it("returns 401 when no token is provided", async () => {
    try {
      const res = await request(app).get("/notes");

      expect(res.status).to.equal(401);
    } catch (err) {
      withContext("returns 401 when no token is provided", err);
    }
  });

  it("returns 400 when required fields are missing", async () => {
    try {
      const res = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ title: "No content" });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("title and content are required.");
    } catch (err) {
      withContext("returns 400 when required fields are missing", err);
    }
  });

  it("creates a note owned by the authenticated user", async () => {
    try {
      const res = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ title: "Test Note", content: "Hello world" });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.include({ title: "Test Note", content: "Hello world", user_id: user.userId });

      noteId = res.body.data.id;
    } catch (err) {
      withContext("creates a note owned by the authenticated user", err);
    }
  });

  it("lists notes for the authenticated user", async () => {
    try {
      const res = await request(app).get("/notes").set("Authorization", `Bearer ${user.token}`);

      expect(res.status).to.equal(200);
      expect(res.body.count).to.equal(1);
      expect(res.body.data[0].id).to.equal(noteId);
    } catch (err) {
      withContext("lists notes for the authenticated user", err);
    }
  });

  it("gets a note by id", async () => {
    try {
      const res = await request(app).get(`/notes/${noteId}`).set("Authorization", `Bearer ${user.token}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(noteId);
    } catch (err) {
      withContext("gets a note by id", err);
    }
  });

  it("returns 404 when fetching a note owned by a different user", async () => {
    try {
      const res = await request(app).get(`/notes/${noteId}`).set("Authorization", `Bearer ${otherUser.token}`);

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
        .set("Authorization", `Bearer ${user.token}`)
        .send({ title: "Updated Title", content: "Updated content" });

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
        .set("Authorization", `Bearer ${user.token}`)
        .send({ title: "x", content: "y" });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when updating a note that does not exist", err);
    }
  });

  it("returns 400 when updating a note with a malformed id", async () => {
    try {
      const res = await request(app)
        .put("/notes/not-a-uuid")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ title: "x", content: "y" });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("Invalid id format.");
    } catch (err) {
      withContext("returns 400 when updating a note with a malformed id", err);
    }
  });

  it("returns 404 when a different user tries to delete the note", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).set("Authorization", `Bearer ${otherUser.token}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when a different user tries to delete the note", err);
    }
  });

  it("deletes a note", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).set("Authorization", `Bearer ${user.token}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(noteId);
    } catch (err) {
      withContext("deletes a note", err);
    }
  });

  it("returns 404 when deleting a note that no longer exists", async () => {
    try {
      const res = await request(app).delete(`/notes/${noteId}`).set("Authorization", `Bearer ${user.token}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Note not found.");
    } catch (err) {
      withContext("returns 404 when deleting a note that no longer exists", err);
    }
  });
});
