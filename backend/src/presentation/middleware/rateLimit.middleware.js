import rateLimit from 'express-rate-limit';
import { getEnvAsNumber } from '../../infrastructure/config/env.validator.js';
import { serverConfig } from '../../infrastructure/config/server.config.js';

/**
 * Límite de intentos de login (fuerza bruta / credential stuffing).
 *
 * Configurable por entorno:
 * - RATE_LIMIT_LOGIN_MAX: intentos FALLIDOS por IP y ventana (default 5; 0 = desactivado).
 * - RATE_LIMIT_WINDOW_MS: ventana en ms (default 900000 = 15 min).
 *
 * Los logins exitosos no cuentan. En NODE_ENV=test está desactivado salvo que
 * RATE_LIMIT_LOGIN_MAX se defina explícitamente (las pruebas de integración hacen muchos logins).
 * Detrás de Nginx, activar TRUST_PROXY para que la IP sea la del cliente.
 *
 * @param {{ limit?: number, windowMs?: number }} [options] sobrescribe el entorno (pruebas)
 */
export function createLoginRateLimiter(options = {}) {
  const limit =
    options.limit ?? getEnvAsNumber('RATE_LIMIT_LOGIN_MAX', serverConfig.isTest ? 0 : 5);
  const windowMs = options.windowMs ?? getEnvAsNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);

  if (!limit || limit <= 0) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) =>
      res.status(429).json({
        error: 'Demasiados intentos de inicio de sesión. Intente de nuevo más tarde.',
      }),
  });
}
