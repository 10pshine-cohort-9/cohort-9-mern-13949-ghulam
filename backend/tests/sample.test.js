import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /', () => {
  it('should return 200 and confirm the API is running', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('API is running');
  });
});

describe('GET /unknown-route', () => {
  it('should return 404 for an unregistered route', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).to.equal(404);
    expect(res.body.error.message).to.include('Not Found');
  });
});
