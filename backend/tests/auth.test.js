import { randomUUID } from "node:crypto";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Auth API", () => {
  const email = `auth-test-${randomUUID()}@example.com`;
  const password = "Password123!";

  after(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  });

  describe("POST /signup", () => {
    it("returns 400 when required fields are missing", async () => {
      const res = await request(app).post("/signup").send({ email, password });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("firstName, lastName, email and password are required");
    });

    it("creates a user and returns a token", async () => {
      const res = await request(app)
        .post("/signup")
        .send({ firstName: "Auth", lastName: "Tester", email, password });

      expect(res.status).to.equal(201);
      expect(res.body.user).to.include({ firstName: "Auth", lastName: "Tester", email });
      expect(res.body.user).to.not.have.property("password");
      expect(res.body.token).to.be.a("string");
      expect(res.body.token.split(".")).to.have.lengthOf(3);
    });

    it("returns 409 when the email is already registered", async () => {
      const res = await request(app)
        .post("/signup")
        .send({ firstName: "Auth", lastName: "Tester", email, password });

      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal("email already registered");
    });
  });

  describe("POST /login", () => {
    it("returns 400 when required fields are missing", async () => {
      const res = await request(app).post("/login").send({ email });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("email and password are required");
    });

    it("returns 401 for an unknown email", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: `unknown-${randomUUID()}@example.com`, password });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("invalid credentials");
    });

    it("returns 401 for an incorrect password", async () => {
      const res = await request(app).post("/login").send({ email, password: "WrongPassword!" });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("invalid credentials");
    });

    it("logs in and returns a token", async () => {
      const res = await request(app).post("/login").send({ email, password });

      expect(res.status).to.equal(200);
      expect(res.body.user).to.include({ email });
      expect(res.body.token).to.be.a("string");
      expect(res.body.token.split(".")).to.have.lengthOf(3);
    });
  });
});
