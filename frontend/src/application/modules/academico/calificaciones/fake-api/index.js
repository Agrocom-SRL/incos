/**
 * Punto de entrada de la fake API de calificaciones.
 */

import { fakeRequest } from './fakeApiClient.js';
import { obtenerCalificacionesCursos } from './endpoints/cursos.endpoint.js';
import { obtenerCuaderno } from './endpoints/cuaderno.endpoint.js';
import {
  actualizarNota,
  crearEvaluacion,
  editarEvaluacion,
  eliminarEvaluacion,
} from './endpoints/evaluaciones.endpoint.js';
import { obtenerTiposEvaluacion } from './endpoints/tiposEvaluacion.endpoint.js';

export const calificacionesFakeApi = {
  obtenerCalificacionesCursos: () => fakeRequest(() => obtenerCalificacionesCursos()),
  obtenerCuaderno: (params) => fakeRequest(() => obtenerCuaderno(params)),
  actualizarNota: (params) => fakeRequest(() => actualizarNota(params)),
  obtenerTiposEvaluacion: (params) => fakeRequest(() => obtenerTiposEvaluacion(params)),
  crearEvaluacion: (params) => fakeRequest(() => crearEvaluacion(params)),
  editarEvaluacion: (params) => fakeRequest(() => editarEvaluacion(params)),
  eliminarEvaluacion: (params) => fakeRequest(() => eliminarEvaluacion(params)),
};

export { FAKE_NETWORK_ERROR } from './fakeApiClient.js';
