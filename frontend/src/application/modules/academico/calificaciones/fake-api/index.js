/**
 * Punto de entrada de la fake API de calificaciones.
 */

import { fakeRequest } from './fakeApiClient.js';
import { obtenerMisCursos } from './endpoints/cursos.endpoint.js';
import { obtenerCuaderno } from './endpoints/cuaderno.endpoint.js';
import { actualizarNota } from './endpoints/evaluaciones.endpoint.js';

export const calificacionesFakeApi = {
  obtenerMisCursos: () => fakeRequest(() => obtenerMisCursos()),
  obtenerCuaderno: (params) => fakeRequest(() => obtenerCuaderno(params)),
  actualizarNota: (params) => fakeRequest(() => actualizarNota(params)),
};

export { FAKE_NETWORK_ERROR } from './fakeApiClient.js';
