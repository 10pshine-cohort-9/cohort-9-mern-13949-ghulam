import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import HttpError from "../utils/httpError.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * @typedef {Object} UserDTO
 * @property {string} id - UUID primary key.
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 */

/**
 * @typedef {Object} AuthResult
 * @property {UserDTO} user
 * @property {string} token - Signed JWT, valid for 1 day.
 */

/**
 * Sign a 1-day JWT carrying the user id and the credential/token version it was
 * issued against. The auth middleware rejects the token once that version no
 * longer matches the user row (e.g. after a password change).
 * @param {string} userId
 * @param {number} tokenVersion
 * @returns {string}
 */
const signToken = (userId, tokenVersion) =>
  jwt.sign({ id: userId, tv: tokenVersion }, process.env.JWT_SECRET, { expiresIn: "1d" });

/**
 * Map a `users` table row (snake_case) to the API DTO (camelCase).
 * @param {{ id: string, first_name: string, last_name: string, email: string }} row
 * @returns {UserDTO}
 */
const toUserDTO = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
});

/**
 * Register a new user and issue a token.
 * @param {{ firstName: string, lastName: string, email: string, password: string }} input
 * @returns {Promise<AuthResult>}
 * @throws {HttpError} 409 if the email is already registered.
 */
const signIn = async ({ firstName, lastName, email, password }) => {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new HttpError(409, "email already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = randomUUID();
  let result;
  try {
    result = await pool.query(
      "INSERT INTO users (id, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, token_version",
      [id, firstName, lastName, email, passwordHash],
    );
  } catch (err) {
    if (err.code === "23505") {
      throw new HttpError(409, "email already registered");
    }
    throw err;
  }

  const row = result.rows[0];
  const user = toUserDTO(row);
  const token = signToken(user.id, row.token_version);

  return { user, token };
};

/**
 * Authenticate by email/password and issue a token.
 * @param {{ email: string, password: string }} input
 * @returns {Promise<AuthResult>}
 * @throws {HttpError} 401 if the credentials are invalid.
 */
const login = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT id, first_name, last_name, email, password, token_version FROM users WHERE email = $1",
    [email],
  );
  const row = result.rows[0];

  if (!row) {
    throw new HttpError(401, "invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, row.password);
  if (!isMatch) {
    throw new HttpError(401, "invalid credentials");
  }

  const token = signToken(row.id, row.token_version);

  return {
    user: toUserDTO(row),
    token,
  };
};

/**
 * Fetch a single user by id.
 * @param {string} userId
 * @returns {Promise<UserDTO>}
 * @throws {HttpError} 404 if no user matches.
 */
const getUserById = async (userId) => {
  const result = await pool.query(
    "SELECT id, first_name, last_name, email FROM users WHERE id = $1",
    [userId],
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "user not found");
  }
  return toUserDTO(row);
};

/**
 * Update a user's profile fields.
 * @param {string} userId
 * @param {{ firstName: string, lastName: string, email: string }} input
 * @returns {Promise<UserDTO>}
 * @throws {HttpError} 409 if the email is already taken, 404 if the user no longer exists.
 */
const updateUser = async (userId, { firstName, lastName, email }) => {
  let result;
  try {
    result = await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING id, first_name, last_name, email",
      [firstName, lastName, email, userId],
    );
  } catch (err) {
    if (err.code === "23505") {
      throw new HttpError(409, "email already registered");
    }
    throw err;
  }

  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "user not found");
  }
  return toUserDTO(row);
};

/**
 * Verify the current password and replace it with a new bcrypt hash. Also bumps
 * `token_version`, which invalidates every JWT issued before this change.
 * @param {string} userId
 * @param {{ currentPassword: string, newPassword: string }} input
 * @returns {Promise<{ message: string }>}
 * @throws {HttpError} 404 if the user no longer exists, 401 if `currentPassword` is wrong.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "user not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, row.password);
  if (!isMatch) {
    throw new HttpError(401, "invalid credentials");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(
    "UPDATE users SET password = $1, token_version = token_version + 1 WHERE id = $2",
    [newPasswordHash, userId],
  );

  return { message: "password updated successfully" };
};

/**
 * Read the current credential/token version for a user. The auth middleware
 * calls this on every authenticated request to reject JWTs issued before the
 * user's last password change.
 * @param {string} userId
 * @returns {Promise<number|null>} the version, or null if the user no longer exists.
 */
const getTokenVersion = async (userId) => {
  const result = await pool.query("SELECT token_version FROM users WHERE id = $1", [userId]);
  return result.rows[0] ? result.rows[0].token_version : null;
};

/**
 * Permanently delete a user account.
 * @param {string} userId
 * @returns {Promise<{ message: string }>}
 * @throws {HttpError} 404 if no user matches.
 */
const deleteUser = async (userId) => {
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
  if (!result.rows[0]) {
    throw new HttpError(404, "user not found");
  }
  return { message: "account deleted successfully" };
};

export { signIn, login, getUserById, updateUser, changePassword, deleteUser, getTokenVersion };
