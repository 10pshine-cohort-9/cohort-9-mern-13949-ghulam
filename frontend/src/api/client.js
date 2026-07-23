import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : undefined);

if (!baseURL) {
  throw new Error('VITE_API_URL is not set');
}

const client = axios.create({ baseURL });

export default client;
