const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const HttpError = require('../utils/httpError');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

const signIn = async ({ name, email, password }) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new HttpError(409, 'email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(user.id);

  return { user, token };
};

const login = async ({ email, password }) => {
  const result = await pool.query('SELECT id, name, email, password FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    throw new HttpError(401, 'invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new HttpError(401, 'invalid credentials');
  }

  const token = signToken(user.id);

  return { user: { id: user.id, name: user.name, email: user.email }, token };
};

module.exports = { signIn, login };
