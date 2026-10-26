import { sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { prepararSesiones, iteracionMixta } from './escenarios.js';

export const setup = prepararSesiones;

export function ejecutar(tokens) {
  iteracionMixta(tokens);
  sleep(Math.random() * 1.5 + 0.5); // tiempo de lectura del usuario
}

/** Resumen en consola + JSON (K6_RESUMEN, por defecto resumen-<perfil>.json). */
export function resumen(nombre) {
  return (data) => ({
    stdout: textSummary(data, { indent: ' ', enableColors: false }),
    [__ENV.K6_RESUMEN || `resumen-${nombre}.json`]: JSON.stringify(data, null, 2),
  });
}
