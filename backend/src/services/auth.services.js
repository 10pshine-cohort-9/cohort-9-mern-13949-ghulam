import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import HttpError from "../utils/httpError.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const UNIQUE_VIOLATION_CODE = "23505";

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

const toUserDTO = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
});

const signUp = async ({ firstName, lastName, email, password }) => {
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
      "INSERT INTO users (id, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email",
      [id, firstName, lastName, email, passwordHash],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION_CODE) {
      throw new HttpError(409, "email already registered");
    }
    throw err;
  }

  const row = result.rows[0];
  const user = toUserDTO(row);
  const token = signToken(user.id);

  return { user, token };
};

const login = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT id, first_name, last_name, email, password FROM users WHERE email = $1",
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

  const token = signToken(row.id);

  return {
    user: toUserDTO(row),
    token,
  };
};

export { signUp, login };
