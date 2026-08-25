import client from '../api/client';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const persistAuth = (data) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

const normalizeError = (err) =>
  new Error(err.response?.data?.message || 'Unable to reach the server. Please try again.');

const register = async ({ firstName, lastName, email, password }) => {
  try {
    const { data } = await client.post('/api/auth/signup', { firstName, lastName, email, password });
    persistAuth(data);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
};

const login = async ({ email, password }) => {
  try {
    const { data } = await client.post('/api/auth/login', { email, password });
    persistAuth(data);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default { register, login, logout, getToken, getUser };
