import { describe, it, expect } from '@jest/globals';
import winston from 'winston';
import Transport from 'winston-transport';
import { redactSensitive, REDACTED } from '../../../src/infrastructure/utils/redactSensitive.js';
import { redactFormat } from '../../../src/infrastructure/config/logger.config.js';
import { ErrorFormatter } from '../../../src/infrastructure/services/ErrorFormatter.js';

describe('redactSensitive', () => {
  it('redacta contraseñas y tokens sin tocar el resto', () => {
    const out = redactSensitive({ email: 'a@b.c', password: 'Secreta-123', token: 'abc' });
    expect(out).toEqual({ email: 'a@b.c', password: REDACTED, token: REDACTED });
  });

  it.each(['password', 'Password', 'passwordNueva', 'nueva_password', 'contraseña', 'contrasena', 'clave', 'authorization', 'accessToken', 'refresh_token', 'apiKey', 'secret'])(
    'redacta la clave "%s"',
    (key) => {
      expect(redactSensitive({ [key]: 'valor' })[key]).toBe(REDACTED);
    }
  );

  it('redacta a cualquier profundidad y dentro de arrays', () => {
    const out = redactSensitive({ usuario: { datos: [{ password: 'x', nombre: 'Ana' }] } });
    expect(out.usuario.datos[0]).toEqual({ password: REDACTED, nombre: 'Ana' });
  });

  it('no muta el objeto original', () => {
    const original = { password: 'x', anidado: { token: 'y' } };
    redactSensitive(original);
    expect(original).toEqual({ password: 'x', anidado: { token: 'y' } });
  });

  it('tolera referencias circulares, primitivos, null y Error', () => {
    const a = { password: 'x' };
    a.self = a;
    expect(() => redactSensitive(a)).not.toThrow();
    expect(redactSensitive(null)).toBeNull();
    expect(redactSensitive('texto')).toBe('texto');
    const err = new Error('falló');
    expect(redactSensitive({ error: err }).error).toBe(err);
  });
});

describe('ErrorFormatter.extractErrorInfo', () => {
  it('no incluye la contraseña del body en el log del error', () => {
    const req = {
      originalUrl: '/api/v1/auth/login',
      method: 'POST',
      ip: '127.0.0.1',
      headers: { authorization: 'Bearer secreto' },
      body: { email: 'a@b.c', password: 'Secreta-123' },
    };
    const info = new ErrorFormatter().extractErrorInfo(new Error('Credenciales inválidas'), req);
    expect(info.body).toEqual({ email: 'a@b.c', password: REDACTED });
    expect(JSON.stringify(info)).not.toContain('Secreta-123');
    expect(JSON.stringify(info)).not.toContain('secreto');
  });
});

describe('redactFormat del logger', () => {
  it('ningún transport recibe la contraseña en la metadata', () => {
    const recibidos = [];
    class Captura extends Transport {
      log(info, done) {
        recibidos.push(JSON.stringify(info));
        done();
      }
    }
    const logger = winston.createLogger({
      format: winston.format.combine(redactFormat(), winston.format.json()),
      transports: [new Captura()],
    });

    logger.error('Login fallido', { body: { email: 'a@b.c', password: 'Secreta-123' }, password: 'Secreta-123' });

    expect(recibidos).toHaveLength(1);
    expect(recibidos[0]).not.toContain('Secreta-123');
    expect(recibidos[0]).toContain(REDACTED);
    expect(recibidos[0]).toContain('a@b.c');
  });
});
