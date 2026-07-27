import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('returns status ok', async () => {
    try {
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'ok' });
    } catch (err) {
      err.message = `GET /health failed: ${err.message}`;
      throw err;
    }
  });
});
