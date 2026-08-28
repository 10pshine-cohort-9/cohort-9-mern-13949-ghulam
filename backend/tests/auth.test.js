import { randomUUID } from "node:crypto";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

const withContext = (label, err) => {
  err.message = `[${label}] ${err.message}`;
  throw err;
};

describe("Auth API", () => {
  const email = `auth-test-${randomUUID()}@example.com`;
  const password = "Password123!";
  let token;

  after(async () => {
    try {
      await pool.query("DELETE FROM users WHERE email = $1", [email]);
    } catch (err) {
      withContext("after hook: clean up test user", err);
    }
  });

  describe("POST /signup", () => {
    it("returns 400 when required fields are missing", async () => {
      try {
        const res = await request(app).post("/api/auth/signup").send({ email, password });

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("firstName, lastName, email and password are required");
      } catch (err) {
        withContext("returns 400 when required fields are missing", err);
      }
    });

    it("returns 400 when the request body is missing", async () => {
      try {
        const res = await request(app).post("/api/auth/signup").set("Content-Type", "application/json");

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("firstName, lastName, email and password are required");
      } catch (err) {
        withContext("returns 400 when the request body is missing", err);
      }
    });

    it("returns 400 for an email with repeated dots in the domain", async () => {
      try {
        const res = await request(app)
          .post("/api/auth/signup")
          .send({ firstName: "Auth", lastName: "Tester", email: "user@domain..com", password });

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("email must be a valid email address");
      } catch (err) {
        withContext("returns 400 for an email with repeated dots in the domain", err);
      }
    });

    it("returns 400 for an email with a trailing dot in the domain", async () => {
      try {
        const res = await request(app)
          .post("/api/auth/signup")
          .send({ firstName: "Auth", lastName: "Tester", email: "user@domain.com.", password });

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("email must be a valid email address");
      } catch (err) {
        withContext("returns 400 for an email with a trailing dot in the domain", err);
      }
    });

    it("creates a user and returns a token", async () => {
      try {
        const res = await request(app)
          .post("/api/auth/signup")
          .send({ firstName: "Auth", lastName: "Tester", email, password });

        expect(res.status).to.equal(201);
        expect(res.body.user).to.include({ firstName: "Auth", lastName: "Tester", email });
        expect(res.body.user).to.not.have.property("password");
        expect(res.body.token).to.be.a("string");
        expect(res.body.token.split(".")).to.have.lengthOf(3);

        token = res.body.token;
      } catch (err) {
        withContext("creates a user and returns a token", err);
      }
    });

    it("returns 409 when the email is already registered", async () => {
      try {
        const res = await request(app)
          .post("/api/auth/signup")
          .send({ firstName: "Auth", lastName: "Tester", email, password });

        expect(res.status).to.equal(409);
        expect(res.body.message).to.equal("email already registered");
      } catch (err) {
        withContext("returns 409 when the email is already registered", err);
      }
    });
  });

  describe("POST /login", () => {
    it("returns 400 when required fields are missing", async () => {
      try {
        const res = await request(app).post("/api/auth/login").send({ email });

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("email and password are required");
      } catch (err) {
        withContext("returns 400 when required fields are missing", err);
      }
    });

    it("returns 401 for an unknown email", async () => {
      try {
        const res = await request(app)
          .post("/api/auth/login")
          .send({ email: `unknown-${randomUUID()}@example.com`, password });

        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal("invalid credentials");
      } catch (err) {
        withContext("returns 401 for an unknown email", err);
      }
    });

    it("returns 401 for an incorrect password", async () => {
      try {
        const res = await request(app).post("/api/auth/login").send({ email, password: "WrongPassword!" });

        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal("invalid credentials");
      } catch (err) {
        withContext("returns 401 for an incorrect password", err);
      }
    });

    it("logs in and returns a token", async () => {
      try {
        const res = await request(app).post("/api/auth/login").send({ email, password });

        expect(res.status).to.equal(200);
        expect(res.body.user).to.include({ email });
        expect(res.body.token).to.be.a("string");
        expect(res.body.token.split(".")).to.have.lengthOf(3);
      } catch (err) {
        withContext("logs in and returns a token", err);
      }
    });
  });

  describe("GET /profile", () => {
    it("returns 401 without a token", async () => {
      try {
        const res = await request(app).get("/api/auth/profile");

        expect(res.status).to.equal(401);
      } catch (err) {
        withContext("returns 401 without a token", err);
      }
    });

    it("returns the authenticated user's profile", async () => {
      try {
        const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body.user).to.include({ firstName: "Auth", lastName: "Tester", email });
        expect(res.body.user).to.not.have.property("password");
      } catch (err) {
        withContext("returns the authenticated user's profile", err);
      }
    });
  });

  describe("PUT /profile", () => {
    it("returns 401 without a token", async () => {
      try {
        const res = await request(app)
          .put("/api/auth/profile")
          .send({ firstName: "Updated", lastName: "Tester", email });

        expect(res.status).to.equal(401);
      } catch (err) {
        withContext("returns 401 without a token", err);
      }
    });

    it("returns 400 when required fields are missing", async () => {
      try {
        const res = await request(app)
          .put("/api/auth/profile")
          .set("Authorization", `Bearer ${token}`)
          .send({ firstName: "Updated" });

        expect(res.status).to.equal(400);
      } catch (err) {
        withContext("returns 400 when required fields are missing", err);
      }
    });

    it("updates the authenticated user's profile", async () => {
      try {
        const res = await request(app)
          .put("/api/auth/profile")
          .set("Authorization", `Bearer ${token}`)
          .send({ firstName: "Updated", lastName: "Tester", email });

        expect(res.status).to.equal(200);
        expect(res.body.user).to.include({ firstName: "Updated", lastName: "Tester", email });
      } catch (err) {
        withContext("updates the authenticated user's profile", err);
      }
    });
  });

  describe("PUT /password", () => {
    it("returns 401 without a token", async () => {
      try {
        const res = await request(app)
          .put("/api/auth/password")
          .send({ currentPassword: password, newPassword: "NewPassword123!" });

        expect(res.status).to.equal(401);
      } catch (err) {
        withContext("returns 401 without a token", err);
      }
    });

    it("returns 401 when currentPassword is incorrect", async () => {
      try {
        const res = await request(app)
          .put("/api/auth/password")
          .set("Authorization", `Bearer ${token}`)
          .send({ currentPassword: "WrongPassword!", newPassword: "NewPassword123!" });

        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal("invalid credentials");
      } catch (err) {
        withContext("returns 401 when currentPassword is incorrect", err);
      }
    });

    it("updates the password and allows login with the new password", async () => {
      try {
        const res = await request(app)
          .put("/api/auth/password")
          .set("Authorization", `Bearer ${token}`)
          .send({ currentPassword: password, newPassword: "NewPassword123!" });

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal("password updated successfully");

        const loginRes = await request(app)
          .post("/api/auth/login")
          .send({ email, password: "NewPassword123!" });

        expect(loginRes.status).to.equal(200);

        token = loginRes.body.token;
      } catch (err) {
        withContext("updates the password and allows login with the new password", err);
      }
    });
  });

  describe("DELETE /profile", () => {
    it("returns 401 without a token", async () => {
      try {
        const res = await request(app).delete("/api/auth/profile");

        expect(res.status).to.equal(401);
      } catch (err) {
        withContext("returns 401 without a token", err);
      }
    });

    it("deletes the authenticated user's account", async () => {
      try {
        const res = await request(app).delete("/api/auth/profile").set("Authorization", `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal("account deleted successfully");

        const profileRes = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${token}`);

        expect(profileRes.status).to.equal(401);
      } catch (err) {
        withContext("deletes the authenticated user's account", err);
      }
    });
  });
});
