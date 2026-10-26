/**
 * Rate limiting del login: configurable por entorno (RATE_LIMIT_LOGIN_MAX / RATE_LIMIT_WINDOW_MS).
 * Se fija el entorno ANTES de cargar la app (el limitador se construye al montar el router).
 */
import { describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';

process.env.RATE_LIMIT_LOGIN_MAX = '3';
process.env.RATE_LIMIT_WINDOW_MS = '60000';

const { default: app } = await import('../../../src/app.js');
const { createLoginRateLimiter } = await import(
  '../../../src/presentation/middleware/rateLimit.middleware.js'
);

describe('POST /auth/login con límite de intentos (3 por ventana)', () => {
  it('tras 3 intentos fallidos el 4.º recibe 429 con RateLimit-* y mensaje sin detalles', async () => {
    const intento = () => request(app).post('/api/v1/auth/login').send({ username: 'x' });

    for (let i = 0; i < 3; i += 1) {
      const res = await intento();
      expect(res.status).toBe(422); // validación: cuenta como fallido, no toca BD
    }
    const bloqueado = await intento();
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toMatch(/Demasiados intentos/);
    expect(bloqueado.headers['ratelimit-limit']).toBe('3');
    expect(bloqueado.headers['retry-after']).toBeDefined();
    expect(bloqueado.headers['x-ratelimit-limit']).toBeUndefined();
  });

  it('el límite solo aplica al login: otras rutas siguen respondiendo', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});

describe('createLoginRateLimiter', () => {
  const montar = (limiter, status) => {
    const mini = express();
    mini.post('/login', limiter, (req, res) => res.status(status).json({ ok: status < 400 }));
    return mini;
  };

  it('con límite 0 queda desactivado', async () => {
    const mini = montar(createLoginRateLimiter({ limit: 0 }), 401);
    for (let i = 0; i < 10; i += 1) {
      expect((await request(mini).post('/login')).status).toBe(401);
    }
  });

  it('los logins exitosos no consumen el cupo', async () => {
    const mini = montar(createLoginRateLimiter({ limit: 2, windowMs: 60000 }), 200);
    for (let i = 0; i < 6; i += 1) {
      expect((await request(mini).post('/login')).status).toBe(200);
    }
  });

  it('los fallidos sí: el siguiente al límite es 429', async () => {
    const mini = montar(createLoginRateLimiter({ limit: 2, windowMs: 60000 }), 401);
    expect((await request(mini).post('/login')).status).toBe(401);
    expect((await request(mini).post('/login')).status).toBe(401);
    expect((await request(mini).post('/login')).status).toBe(429);
  });
});
