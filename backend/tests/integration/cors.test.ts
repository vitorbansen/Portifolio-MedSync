import request from 'supertest';
import { app } from '../../src/app';

describe('CORS', () => {
  it('permite requisição de uma origem presente em CORS_ORIGIN', async () => {
    const res = await request(app).get('/metrics').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('responde ao preflight (OPTIONS) de uma origem permitida', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('bloqueia requisição de uma origem não permitida', async () => {
    const res = await request(app).get('/metrics').set('Origin', 'http://evil.example.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.status).toBe(500);
  });

  it('permite requisição sem header Origin (ex.: chamada servidor-a-servidor)', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
  });
});
