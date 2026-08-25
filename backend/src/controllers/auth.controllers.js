import * as authService from '../services/auth.services.js';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const isValidEmail = (value) => {
  if (/\s/.test(value)) {
    return false;
  }
  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
    return false;
  }
  const domain = value.slice(atIndex + 1);
  const dotIndex = domain.indexOf('.');
  return dotIndex > 0 && dotIndex < domain.length - 1;
};

const signIn = async (req, res, next) => {
  const firstName = req.body.firstName?.trim();
  const lastName = req.body.lastName?.trim();
  const email = req.body.email?.trim();
  const { password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'firstName, lastName, email and password are required' });
  }

  if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ message: 'firstName and lastName must be 100 characters or fewer' });
  }

  if (email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    return res.status(400).json({ message: 'email must be a valid email address' });
  }

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({ message: 'password must be between 8 and 128 characters' });
  }

  try {
    const { user, token } = await authService.signIn({ firstName, lastName, email, password });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const { user, token } = await authService.login({ email, password });
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
};

export { signIn, login };
