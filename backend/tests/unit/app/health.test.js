import request from 'supertest';
import app from '../../../src/app.js';

describe('GET /health', () => {
  it('responde 200 sin tocar la BD', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.environment).toBe('test');
  });

  it('expone el mismo handler en /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });
});
