import client from '../api/client';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const persistAuth = (data) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

const register = async ({ firstName, lastName, email, password }) => {
  const { data } = await client.post('/signup', { firstName, lastName, email, password });
  persistAuth(data);
  return data;
};

const login = async ({ email, password }) => {
  const { data } = await client.post('/login', { email, password });
  persistAuth(data);
  return data;
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
