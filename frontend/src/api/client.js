import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : undefined);

if (!baseURL) {
  throw new Error('VITE_API_URL is not set');
}

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
