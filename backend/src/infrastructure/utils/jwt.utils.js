import jwt from 'jsonwebtoken';

/**
 * Utilidades JWT para auth stateful.
 * La validez operativa depende de la fila activa en sesiones (AuthRepository.findSesionActiva).
 */

/** Algoritmo fijo: evita confusión de algoritmos (alg=none / HS384 / RS256). */
const JWT_ALGORITHM = 'HS256';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || String(secret).trim() === '') {
    throw new Error('JWT_SECRET no está definido en el entorno');
  }
  return secret;
}

/**
 * @param {{ userId: number, rolId: number|null, rolCodigo: string|null }} payload
 */
export function generarToken(payload) {
  return jwt.sign(payload, getSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

export function verificarToken(token) {
  return jwt.verify(token, getSecret(), { algorithms: [JWT_ALGORITHM] });
}

/**
 * @returns {Date|null}
 */
export function calcularFechaExpiracion() {
  const expires = process.env.JWT_EXPIRES_IN || '8h';
  const match = String(expires).match(/^(\d+)([smhd])$/);
  if (!match) return null;
  const valor = parseInt(match[1], 10);
  const unidad = match[2];
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + valor * ms[unidad]);
}
