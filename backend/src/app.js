import express from 'express';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
