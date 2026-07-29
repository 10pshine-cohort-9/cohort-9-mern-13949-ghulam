import client from '../api/client';

const TOKEN_KEY = 'token';

const register = async ({ firstName, lastName, email, password }) => {
  const { data } = await client.post('/signup', { firstName, lastName, email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

const login = async ({ email, password }) => {
  const { data } = await client.post('/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

export default { register, login, logout, getToken };
