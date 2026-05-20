/**
 * Cliente fake: latencia, errores simulados y ejecución contra fakeDatabase.
 */

const FAKE_ERROR_RATE = 0.03;
const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 500;

export const FAKE_NETWORK_ERROR = 'FAKE_NETWORK_ERROR';

export async function fakeRequest(endpointFn, payload) {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (Math.random() < FAKE_ERROR_RATE) {
    console.warn('[calificaciones fake-api] Error de red simulado');
    const err = new Error(FAKE_NETWORK_ERROR);
    err.code = FAKE_NETWORK_ERROR;
    throw err;
  }

  return endpointFn(payload);
}
