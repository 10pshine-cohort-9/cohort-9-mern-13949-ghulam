import client from '../api/client';

const TOKEN_KEY = 'token';

const normalizeError = (err) =>
  new Error(err.response?.data?.message || 'Unable to reach the server. Please try again.');

const register = async ({ firstName, lastName, email, password }) => {
  try {
    const { data } = await client.post('/api/auth/signup', { firstName, lastName, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
};

const login = async ({ email, password }) => {
  try {
    const { data } = await client.post('/api/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

export default { register, login, logout, getToken };
